// workers/submissionWorker.js
require('dotenv').config();
const { Worker }   = require('bullmq');
const axios        = require('axios');
const { connection } = require('../utils/queue');
const submission   = require('../models/submission');
const dbconnection = require('../db');

(async () => { await dbconnection(); })();

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const headers = {
  'x-rapidapi-key':  process.env.JUDGE0_KEY,
  'x-rapidapi-host': process.env.JUDGE0_HOST,
  'Content-Type':    'application/json'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────


const encode = (str) => (str != null ? Buffer.from(str).toString('base64') : undefined);
const decode = (str) => (str        ? Buffer.from(str, 'base64').toString() : null);
// Normalize before comparing: trim surrounding whitespace + unify line endings.
// This prevents false Wrong-Answer verdicts caused by a trailing '\n' or '\r\n'
// that the program emits but the stored expected_output omits (or vice-versa).
const normalize = (s) => (s ?? '').trim().replace(/\r\n/g, '\n');

async function sendBatch(submissions) {
  const res = await axios.post(
    `${JUDGE0_URL}/submissions/batch?base64_encoded=true`,
    { submissions },
    { headers }
  );
  return res.data.map(t => t.token);
}

async function pollBatch(tokens) {
  const joined = tokens.join(',');
  while (true) {
    const res = await axios.get(
      `${JUDGE0_URL}/submissions/batch?tokens=${joined}&base64_encoded=true`,
      { headers }
    );
    const all = res.data.submissions;
    if (all.every(s => s.status.id >= 3)) return all;
    await new Promise(r => setTimeout(r, 1500));
  }
}

function shapeResult(r, tc) {
  const actualOutput   = decode(r.stdout);
  const expectedOutput = tc.expected_output ?? null;

  // Judge0 status 3 = no compile/runtime error (code ran successfully).
  // We do our own output comparison so we are not affected by Judge0's
  // strict byte-for-byte match (which fails on trailing newlines, CRLF, etc.).
  const ranSuccessfully = r.status.id === 3;
  const outputMatches   = normalize(actualOutput) === normalize(expectedOutput);
  const passed          = ranSuccessfully && outputMatches;

  return {
    input:           tc.input,
    expected_output: expectedOutput,
    actual_output:   actualOutput,
    status:          passed ? 'Accepted' : r.status.description,
    passed,
    runtime_ms:      r.time   ?? null,
    memory_kb:       r.memory ?? null
  };
}

// ─── Worker ───────────────────────────────────────────────────────────────────

const worker = new Worker('submission-queue', async job => {
  const { source_code, language_id, test_cases, submission_id, is_run } = job.data;
  console.log(`Processing job [${job.name}] id=${job.id}`);

  try {
    
    const batchPayload = test_cases.map(tc => ({
      source_code: encode(source_code),
      language_id,
      stdin:       encode(tc.input ?? ''),
    }));

    const tokens  = await sendBatch(batchPayload);
    const results = await pollBatch(tokens);

    const shaped = results.map((r, i) => shapeResult(r, test_cases[i]));

    const passedCount = shaped.filter(r => r.passed).length;
    const maxRuntime  = Math.max(...results.map(r => r.time   || 0));
    const maxMemory   = Math.max(...results.map(r => r.memory || 0));

    if (is_run) {
      const runStatus = results[0].status.id === 6
        ? 'CompilationError'
        : [7, 8, 9, 10, 11, 12].includes(results[0].status.id)
          ? 'RunTimeError'
          : shaped.every(r => r.passed) ? 'Completed' : 'Failed';

      if (submission_id) {
        await submission.findByIdAndUpdate(submission_id, {
          status:       runStatus,
          runtime_ms:   maxRuntime,
          memory_kb:    maxMemory,
          test_results: shaped
        });
        console.log(`✅ Run saved → submission ${submission_id} [${runStatus}]`);
      } else {
        console.log(`✅ Ghost run complete (no DB update) — job ${job.id}`);
      }

      return { shaped, runStatus, passedCount, total: shaped.length };
    }

    // ── For a real submit, derive final status from our own shaped results ──
    // Use raw Judge0 status ids for compile/runtime/TLE (reliable),
    // but use our own passed flags for Accepted vs Wrong Answer.
    const hasCE  = results.some(r => r.status.id === 6);
    const hasRTE = results.some(r => [7, 8, 9, 10, 11, 12].includes(r.status.id));
    const hasTLE = results.some(r => r.status.id === 5);

    const finalStatus = hasCE  ? 'CompilationError'
                      : hasRTE ? 'RunTimeError'
                      : hasTLE ? 'Failed'
                      : passedCount === shaped.length ? 'Completed'
                      : 'Failed';

    await submission.findByIdAndUpdate(submission_id, {
      status:              finalStatus,
      runtime_ms:          maxRuntime,
      memory_kb:           maxMemory,
      test_results_hidden: shaped
    });

    console.log(`✅ Submit ${submission_id}: ${finalStatus} (${passedCount}/${shaped.length})`);
    return { finalStatus, passedCount, total: shaped.length };

  } catch (err) {
    console.error(`❌ Job ${job.id} failed:`, err.response?.data || err.message);
    if (submission_id) {
      await submission.findByIdAndUpdate(submission_id, { status: 'Failed' });
    }
    throw err;
  }

}, { connection });

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} done:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed permanently:`, err.message);
});
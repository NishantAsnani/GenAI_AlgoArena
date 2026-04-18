require('dotenv').config()
const { submissionQueue,connection } = require('../utils/queue');
const Joi=require('joi');
const axios=require('axios');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const submission=require('../models/submission');
const dbconnection=require('../db');


(async () => {
await dbconnection();
})();


const worker = new Worker('submission-queue', async job => {
    const { source_code, language_id, input, submission_id } = job.data;
    console.log(`Processing job ${job.id} for submission ${submission_id}...`);
    
    // 1. Validate Environment Variables
    const headers = {
        'x-rapidapi-key': process.env.JUDGE0_KEY,
        'x-rapidapi-host': process.env.JUDGE0_HOST,
        'Content-Type': 'application/json'
    };

    try {
        // 2. Create submission with Base64 encoding
        const createRes = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
            {
                source_code:source_code,
                language_id,
                stdin: input ? input : ""
            },
            { headers }
        );

        const token = createRes.data.token;
        let result;

        // 3. Poll for result
        while (true) {
            const res = await axios.get(
                `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
                { headers }
            );

            // status.id < 3 means "In Queue" or "Processing"
            if (res.data.status.id >= 3) {
                result = res.data;
                break;
            }
            await new Promise(r => setTimeout(r, 1500)); 
        }

        // 4. Decode results
        const decodedResult = {
            stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
            stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
            compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : null,
            status: result.status
        };

        // 5. Update Database
        console.log(`Updating submission ${submission_id} with result:`, decodedResult);

        await submission.findByIdAndUpdate(submission_id, {
            status: "Completed",
            runtime_ms: result.time,
            memory_kb: result.memory,
            test_results: decodedResult
        });

    } catch (err) {
        console.error(`Job ${job.id} failed:`, err.response?.data || err.message);
        // Update DB to failed status if needed
        await submission.findByIdAndUpdate(submission_id, { status: "Failed" });
        throw err; 
    }
}, { connection });



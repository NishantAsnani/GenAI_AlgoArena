require('dotenv').config()
const { submissionQueue } = require('../utils/queue');
const {connection}=require('./queue')
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

    const headers = {
        'x-rapidapi-key': process.env.JUDGE0_KEY,
        'x-rapidapi-host': process.env.JUDGE0_HOST,
        'Content-Type': 'application/json'
    };

    try {
        const createRes = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
            {
                source_code: Buffer.from(source_code).toString('base64'),
                language_id,
                stdin: Buffer.from(input ? input : "").toString('base64')
            },
            { headers }
        );

        const token = createRes.data.token;
        let result;

        while (true) {
            const res = await axios.get(
                `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
                { headers }
            );

            if (res.data.status.id >= 3) {
                result = res.data;
                break;
            }
            await new Promise(r => setTimeout(r, 1500)); 
        }

        const decodedResult = {
            stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
            stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
            compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : null,
            status: result.status
        };

        console.log(`Updating submission ${submission_id} with result:`, decodedResult);
        const requiredSubmission = await submission.findById(submission_id);

        if (!requiredSubmission) {
            console.error(`Submission ${submission_id} not found in DB!`);
            return;
        }

        requiredSubmission.status= decodedResult.status.description === 'Accepted' ? 'Completed' : 'Failed';
        requiredSubmission.runtime_ms= result.time;
        requiredSubmission.memory_kb= result.memory;
        // Store as array to match mongoose schema: test_results: [{ type: Object }]
        requiredSubmission.test_results= [decodedResult];

        await requiredSubmission.save();
        console.log(`✅ Submission ${submission_id} updated successfully!`);    

    } catch (err) {
        console.error(`Job ${job.id} failed:`, err.response?.data || err.message);
        await submission.findByIdAndUpdate(submission_id, { status: "Failed" });
        throw err; 
    }
}, { connection });
const Joi=require('joi');
const axios=require('axios');
const { submissionQueue } = require('../utils/queue');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE } = require('../utils/constants');
const submission=require('../models/submission');

async function addSubmission(req, res) {
    const submissionSchema = Joi.object({
        code: Joi.string().required(),
        language_id: Joi.number().integer().required(),
        input: Joi.string().optional()
    });

    try {
        const { error, value } = submissionSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        console.log(req.user,"user in submission controller");

        const newSubmission=await submission.create({
            user_id:req.user.id,
            code:value.code,
            problem_id:req?.params?.problemId,
            language_id:value.language_id,
            input:value.input || ""
        });

        const job = await submissionQueue.add('execute-code', {
            source_code: value.code,
            submission_id:newSubmission._id,
            language_id: value.language_id,
            input: value.input || ""
        });

        return sendSuccessResponse(
            res,
            { jobId: job.id },
            "Submission queued successfully",
            STATUS_CODE.CREATED
        );

    } catch (err) {
        sendErrorResponse(
            res,
            {},
            `Error Adding Submission: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
        );
    }
}

async function getSubmissionResult(req, res) {
    const submissionIdSchema = Joi.object({
        id: Joi.string().required()
    });
    try{
        const {error, value} = submissionIdSchema.validate(req.params);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const submissionId = value.id;
        const submissionResult=await submission.findById(submissionId);
        if(!submissionResult){
            return sendErrorResponse(res, {}, "Submission not found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(res, submissionResult, "Submission result retrieved successfully", STATUS_CODE.SUCCESS);
    }catch(err){
        return sendErrorResponse(res, {}, `Error retrieving submission result: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}


module.exports = {
    addSubmission,
    getSubmissionResult
};
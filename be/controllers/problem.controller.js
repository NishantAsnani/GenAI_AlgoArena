const problem=require('../models/Problem');
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
// const problemServices=require('../services/problem.service');
const Joi=require('joi');
const axios=require('axios');
const { submissionQueue } = require('../utils/queue');


async function addProblem(req,res){
    const problemSchema=Joi.object({
        title:Joi.string().required(),
        lesson_id:Joi.string().required(),
        description_md:Joi.string().required(),
        difficulty:Joi.string().valid('Easy','Medium','Hard').required(),
        tags:Joi.array().items(Joi.string()),
        supported_languages:Joi.array().items(Joi.string()),
        constraints:Joi.object(),
        test_cases:Joi.array().items(Joi.object()),
        hints:Joi.array().items(Joi.object()),
        solution_meta:Joi.object()
    });
try{
    const {error, value} = problemSchema.validate(req.body);

    if(error){
        return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const newProblem = await problem.create(value);

    return sendSuccessResponse(
        res,
        {problem: newProblem},
        "Problem Added Successfully",
        STATUS_CODE.CREATED
      );
}catch(err){
    return sendErrorResponse(
        res,
        {},
        `Error Adding Problem: ${err.message}`,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
}

}

async function getAllProblems(req,res){
    const querySchema=Joi.object({
    page:Joi.number().integer().min(1).default(1),
    limit:Joi.number().integer().min(1).max(100).default(10),
})
    try{
        const {error, value} = querySchema.validate(req.query);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {page, limit} = value;
        const offset= (page - 1) * limit;

        const allProblems=await problem.findAll().skip(offset).limit(limit);
        return sendSuccessResponse(
            res,
            {problems: allProblems},
            "Problems Retrieved Successfully",
            STATUS_CODE.OK
          );
    }catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Retrieving Problems: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}


async function getProblemById(req,res){
    const idSchema=Joi.object({
        id:Joi.string().required()
    });
    try{
        const {error, value} = idSchema.validate(req.params);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const problemId=value.id;
        const fetchProblem=await problem.findById(problemId);
        if(!fetchProblem){
            return sendErrorResponse(res, {}, "Problem Not Found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(
            res,
            {problem: fetchProblem},
            "Problem Retrieved Successfully",
            STATUS_CODE.OK
          );
    }
    catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Retrieving Problem: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}

async function updateProblem(req,res){
    const idSchema=Joi.object({
        id:Joi.string().hex().required()
    });
    const updateSchema=Joi.object({
        title:Joi.string(),
        lesson_id:Joi.string().hex(),
        description_md:Joi.string(),
        difficulty:Joi.string().valid('Easy','Medium','Hard'),
        tags:Joi.array().items(Joi.string()),
        supported_languages:Joi.array().items(Joi.string()),
        constraints:Joi.object(),
        test_cases:Joi.array().items(Joi.object()),
        hints:Joi.array().items(Joi.object()),
        solution_meta:Joi.object()
    });
    try{
        const {error: idError, value: idValue} = idSchema.validate(req.params);
        if(idError){
            return sendErrorResponse(res, idError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const problemId=idValue.id;
        const {error: updateError, value: updateValue} = updateSchema.validate(req.body);
        if(updateError){
            return sendErrorResponse(res, updateError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const updatedProblem=await problem.findByIdAndUpdate(problemId, updateValue, {new: true});
        if(!updatedProblem){
            return sendErrorResponse(res, {}, "Problem Not Found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(
            res,
            {problem: updatedProblem},
            "Problem Updated Successfully",
            STATUS_CODE.OK
          );
    }catch(err){
        return sendErrorResponse(
            res,
            {},
            `Error Updating Problem: ${err.message}`,
            STATUS_CODE.INTERNAL_SERVER_ERROR
          );
    }
}



// async function getSubmissionResult(req, res) {
//     const tokenSchema = Joi.object({
//         token: Joi.string().required()
//     });
//     try {
        
//         const { error, value } = tokenSchema.validate(req.params);
//         if (error) {
//             return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
//         }
//         const { token } = value;
//         console.log(`Fetching result for token: ${token}`);
//         const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`;
//         const headers = {
//             'x-rapidapi-key': process.env.JUDGE0_KEY,
//             'x-rapidapi-host': process.env.JUDGE0_HOST,
//             'Content-Type': 'application/json'
//         }
//         const response = await axios.get(url, { headers: headers });
//         const result = {
//             stdout: response.data.stdout ? Buffer.from(response.data.stdout, 'base64').toString('utf-8') : null,
//             stderr: response.data.stderr ? Buffer.from(response.data.stderr, 'base64').toString('utf-8') : null,
//             compile_output: response.data.compile_output ? Buffer.from(response.data.compile_output, 'base64').toString('utf-8') : null,
//             message: response.data.message,
//             status: response.data.status
//         };
//         return sendSuccessResponse(
//             res,
//             { result: result },
//             "Submission Result Retrieved Successfully",
//             STATUS_CODE.OK
//         );
//     } catch (err) {
//         sendErrorResponse(
//             res,
//             {},
//             `Error Retrieving Submission Result: ${err.message}`,
//             STATUS_CODE.INTERNAL_SERVER_ERROR
//         );
//     }
// }

module.exports={
    addProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
}
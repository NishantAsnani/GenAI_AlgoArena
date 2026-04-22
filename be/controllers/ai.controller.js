const Joi=require('joi');
const axios=require('axios');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE } = require('../utils/constants');


async function generateCode(req,res){
    const codeSchema=Joi.object({
        prompt:Joi.string().required(),
        language:Joi.string().valid('python', 'javascript', 'java', 'cpp').default('python')
    });
    try{
        const {error, value} = codeSchema.validate(req.body);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
    }catch(err){
        return sendErrorResponse(res, {}, `Error Generating Code: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}
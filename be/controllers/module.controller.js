const Module = require('../models/Module');
const { sendSuccessResponse,sendErrorResponse } = require('../utils/response');
const Joi=require('joi');
const {STATUS_CODE}=require('../utils/constants')

async function getAllModules(req, res) {
    const moduleQuerySchema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    });
    try{
        const {error, value} = moduleQuerySchema.validate(req.query);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {page=1, limit=10} = value;
        const offset = (page - 1) * limit;
        const modules = await Module.find().skip(offset).limit(limit).populate({
            path: 'lessons',
            populate: {
                path: 'problems'
            }
        });

        return sendSuccessResponse(res, modules, "Modules fetched successfully", STATUS_CODE.SUCCESS);
    }catch(err){
        console.log(err)
        return sendErrorResponse(res, err, "Failed to fetch modules", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

async function getModuleById(req, res) {
    const moduleIdSchema = Joi.object({
        id: Joi.string().hex().required()
    });
    try{
        const {error, value} = moduleIdSchema.validate(req.params);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {id} = value;
        const requiredModule = await Module.findById(id).populate({
            path: 'lessons',
            populate: {
                path: 'problems'
            }
        });

        if(!requiredModule){
            return sendErrorResponse(res, null, "Module not found", STATUS_CODE.NOT_FOUND);
        }

        return sendSuccessResponse(res, requiredModule, "Module fetched successfully", STATUS_CODE.SUCCESS);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to fetch module", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

async function createModule(req, res) {
    const moduleSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
        tags: Joi.array().items(Joi.string()),
        lessons: Joi.array().items(Joi.string().hex())
    });

    try{
        const {error, value} = moduleSchema.validate(req.body);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const newModule = await Module.create({
            title: value.title,
            description: value.description,
            difficulty: value.difficulty,
            tags: value.tags,
            created_by: req.user._id,
            lessons: value.lessons || []
        });

        return sendSuccessResponse(res, newModule, "Module created successfully", STATUS_CODE.CREATED);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to create module", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

async function editModule(req, res) {
    const moduleIdSchema = Joi.object({
        id: Joi.string().hex().required()
    });

    const moduleUpdateSchema = Joi.object({
        title: Joi.string(),
        description: Joi.string(),
        difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
        tags: Joi.array().items(Joi.string()),
        lessons: Joi.array().items(Joi.string().hex())
    });

    try{
        const {error: idError, value: idValue} = moduleIdSchema.validate(req.params);

        if(idError){
            return sendErrorResponse(res, idError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {error: updateError, value: updateValue} = moduleUpdateSchema.validate(req.body);

        if(updateError){
            return sendErrorResponse(res, updateError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }

        const {id} = idValue;
        const updatedModule = await Module.findByIdAndUpdate(id, updateValue, { new: true });

        if(!updatedModule){
            return sendErrorResponse(res, null, "Module not found", STATUS_CODE.NOT_FOUND);
        }

        return sendSuccessResponse(res, updatedModule, "Module updated successfully", STATUS_CODE.SUCCESS);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to update module", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
getAllModules,
getModuleById,
createModule,
editModule
}
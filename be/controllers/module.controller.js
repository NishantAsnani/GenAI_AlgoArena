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
        const modules = await Module.findAll({
            offset,
            limit
        });

    
        return sendSuccessResponse(res, modules, "Modules fetched successfully");
    }catch(err){
        return sendErrorResponse(res, err, "Failed to fetch modules");
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
        const requiredModule = await Module.findByPk(id);

        if(!requiredModule){
            return sendErrorResponse(res, null, "Module not found", STATUS_CODE.NOT_FOUND);
        }

        return sendSuccessResponse(res, requiredModule, "Module fetched successfully");
    }catch(err){
        return sendErrorResponse(res, err, "Failed to fetch module");
    }
}

async function createModule(req, res) {
    const moduleSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
        tags: Joi.array().items(Joi.string()),
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
            created_by: req.user._id
        });

        return sendSuccessResponse(res, newModule, "Module created successfully", STATUS_CODE.CREATED);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to create module");
    }
}


module.exports = {
getAllModules,
getModuleById,
createModule
}


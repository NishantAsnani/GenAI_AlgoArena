const Joi=require('joi');
const Lesson=require('../models/Lesson');
const { sendSuccessResponse,sendErrorResponse } = require('../utils/response');
const {STATUS_CODE}=require('../utils/constants')


async function createLesson(req, res) {
    const lessonSchema = Joi.object({
        module_id: Joi.string().hex().required(),
        title: Joi.string().required(),
        content_type: Joi.string(),
        content_md: Joi.string(),
        video_urls: Joi.array().items(Joi.string()),
        order_index: Joi.number().integer().min(0),
        xp_reward: Joi.number().integer().min(0),
        problems: Joi.array().items(Joi.string().hex())
    });

    try{
        const {error, value} = lessonSchema.validate(req.body);
        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const newLesson = await Lesson.create({
            module_id: value.module_id,
            title: value.title,
            content_type: value.content_type,
            content_md: value.content_md,
            video_urls: value.video_urls,
            order_index: value.order_index,
            xp_reward: value.xp_reward,
            problems: value.problems
        });

        return sendSuccessResponse(res, newLesson, "Lesson created successfully", STATUS_CODE.CREATED);
    }catch(err){
        return sendErrorResponse(res, err, "Failed to create lesson");
    }
}

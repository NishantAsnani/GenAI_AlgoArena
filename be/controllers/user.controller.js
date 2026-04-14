const  User  = require("../models/users");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
const userServices = require("../services/user.service");
const Joi=require('joi');


async function getAllUsers(req, res) {
  const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    name: Joi.string().allow('')
  });
  try {

    const {error, value} = querySchema.validate(req.query);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const {page=1, limit=10, name: nameSearch} = value;


    const allUsers = await userServices.getAllUsers({
      page,
      limit,
      nameSearch
    });

    
    if(allUsers) {
      return sendSuccessResponse(
      res,
      {users:allUsers.data,pagination:allUsers.pagination},
      "Users Retrieved Successfully",
      STATUS_CODE.OK
    );
    }
    
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving Users: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function getUserById(req, res) {
  const idSchema = Joi.object({
    id: Joi.string().hex().required()
  });
  try {
    const {error, value} = idSchema.validate(req.params);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = value.id;
    const fetchUser = await userServices.fetchUserById(userId);

    if(!fetchUser) {
      return sendErrorResponse(
        res,
        {},
        "User Not Found",
        STATUS_CODE.NOT_FOUND
      );
    }

    
      return sendSuccessResponse(
        res,
        fetchUser,
        "User Retrieved Successfully",
        STATUS_CODE.SUCCESS
      );
    
    
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving User: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function deleteUser(req, res) {
  const idSchema = Joi.object({
    id: Joi.string().hex().required()
  });
  try {
    const {error, value} = idSchema.validate(req.params);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = value.id;

    const deletedUser= await userServices.deleteUser(userId);

    if(deletedUser) {
      return sendSuccessResponse(
        res,
        deletedUser.data,
        "User Deleted Successfully",
        STATUS_CODE.OK
      );
    } 
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving User: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function editUser(req, res) {
  const editUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6)
  });
  try {
    const {error, value} = editUserSchema.validate(req.body);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = req.params.id;
    const { name, email, password } = value;

    if (!userId) {
      return sendErrorResponse(
        res,
        {},
        "User ID is required",
        STATUS_CODE.BAD_REQUEST
      );
    }

    const existingUser = await userServices.fetchUserById(userId);

    if (!existingUser) {
      return sendErrorResponse(
        res,
        {},
        "User Not Found",
        STATUS_CODE.NOT_FOUND
      );
    }


    

    const updatedUser = await userServices.updateUser(userId,existingUser,{ name, email, password });

    if (updatedUser) {
      return sendSuccessResponse(
        res,
        updatedUser.data,
        "User Updated Successfully",
        STATUS_CODE.SUCCESS
      );
    } 

  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Updating User: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}



module.exports={
    getAllUsers,
    getUserById,
    deleteUser,
    editUser
}
const User = require("../models/users");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authServices = require("../services/auth.service");
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";
const { getOAuthClient } = require("../utils/helper");
async function Login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse(
        res,
        {},
        "Invalid Credentials",
        STATUS_CODE.NOT_FOUND
      );
    }
    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      sendErrorResponse(
        res,
        {},
        "Invalid Credentials",
        STATUS_CODE.UNAUTHORIZED
      );
    } else {

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "24h" }
      );



      return sendSuccessResponse(
        res,
        { token, email },
        "Logged In Sucessfully",
        STATUS_CODE.SUCCESS
      );
    }
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      "Internal Server Error",
      STATUS_CODE.UNAUTHORIZED
    );
  }
}

async function Signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });


    if (existingUser) {
      return sendErrorResponse(
        res,
        {},
        "User Already Exists",
        STATUS_CODE.CONFLICT
      );
    }

    const createUser = await authServices.createNewUser({
      name,
      email,
      password,
      google_id: null
    });

    if (createUser) {
      return sendSuccessResponse(
        res,
        { data: createUser.data },
        "User Created Successfully",
        STATUS_CODE.CREATED
      );
    }
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Creating User: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function generateRedirectUrl(req, res) {
  try {
    const oauth2Client = getOAuthClient();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state: "login"
    });

    sendSuccessResponse(
      res,
      { auth_url: url },
      "Google Auth URL generated successfully",
      STATUS_CODE.SUCCESS
    );
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error generating redirect URL: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function handleGoogleCallback(req, res) {
  try {
    const { code } = req.query;
    const oauth2Client = getOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });


    const payload = ticket.getPayload();
    const user= await User.findOne({ email: payload.email });

    if(user){
      if(!user.google_id){
        user.google_id = payload.sub;
        await user.save();
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "24h" }
      );

      return sendSuccessResponse(
        res,
        { token, email:user.email },
        "Logged In Sucessfully",
        STATUS_CODE.SUCCESS
      );
    }

    const createUser = await authServices.createNewUser({
      name: payload.name,
      email: payload.email,
      password: null,
      google_id: payload.sub
    });


    return sendSuccessResponse(
      res,
      {},
      "Google Signup successful",
      STATUS_CODE.SUCCESS
    );

  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error handling Google callback: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  Login,
  Signup,
  generateRedirectUrl,
  handleGoogleCallback
};

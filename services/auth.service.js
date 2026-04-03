const User = require("../models/users");
async function createNewUser(userData) {
  try {
      const { name, email, password, google_id } = userData;


    const newUser = await User.create({
      name,
      email,
      password,
      google_id
    });
    return newUser;
  } catch (err) {
    throw new Error(err);
  }
}


module.exports = {
  createNewUser
};
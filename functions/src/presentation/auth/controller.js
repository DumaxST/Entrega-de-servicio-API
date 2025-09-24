// const admin = require("firebase-admin");
const { userDto } = require("../../domain");

class AuthController {
    
  static registerUser(req, res){
    const [error, registerDto] = userDto.create(req.body);
    if ( error ) return res.status(400).json({ error });
    res.json(registerDto);
  }

  static async login(req, res){
    res.json("login user");
  }

  static logout(req, res){
    res.json("logout user");
  }

  static validateEmail(req, res){
    res.json("validate email");
  }
}

module.exports = AuthController;
class AuthController {
  static registerUser(req, res){
    res.json("register user");
  }

  static login(req, res){
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
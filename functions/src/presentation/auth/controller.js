const { userDto, loginDto, UserEntity } = require("../../domain");
const { CustomError } = require("../../domain");

class AuthController {
  constructor(authService){
    this.authService = authService;
  }
   handleError = (error, res) =>{
       if (error instanceof CustomError){
           return res.status(error.statusCode).json({error: error.message});
       }
       return res.status(500).json({error: "Internal server error"});
   }

  registerUser =  (req, res) => {
      const [error, registerDto] = userDto.create(req.body);

      if (error) return res.status(400).json({ error });

       this.authService.registerUser(registerDto)
        .then((user) => {

          res.json(user);
        })
        .catch((error) => this.handleError(error, res));

  }

  login = (req, res) => {
    const [error, loginDto] = loginDto.create(req.body);

    if (error) return res.status(400).json({ error });

    this.authService.loginUser(loginDto)
      .then((user) => {
        res.json({
          message: "Login successful",
          user
        });
      })
      .catch((error) => this.handleError(error, res));
  }

  logout = (req, res) => {
    res.json("logout user");
  }

  validateEmail = (req, res) => {
    res.json("validate email");
  }
}

module.exports = AuthController;
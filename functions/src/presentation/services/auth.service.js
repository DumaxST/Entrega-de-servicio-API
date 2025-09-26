const {getAuth} = require("firebase-admin/auth");
const { CustomError, UserEntity } = require("../../domain");

class  AuthService {
    constructor(){
    }
   
    async registerUser(registerUserDto){
        try {
            const userRecord = await getAuth().createUser({
                email: registerUserDto.email,
                password: registerUserDto.password,
                displayName: registerUserDto.name
            });

          const {...props} = UserEntity.fromObject(userRecord)
          return {
            ...props,
            token:"fake-jwt-token"
          }
        } catch (error) {
            console.log("Error creating new user:", error);
            
            if (error.code === "auth/email-already-exists") {
                throw CustomError.badRequest("Email already in use");
            }
            if (error.code === "auth/weak-password") {
                throw CustomError.badRequest("Password is too weak");
            }
            if (error.code === "auth/invalid-email") {
                throw CustomError.badRequest("Invalid email format");
            }
            
            throw CustomError.internalServer("Error creating user");
        }
    }
    async loginUser(loginDto){
        try {
            const userRecord = await getAuth().getUserByEmail(loginDto.email);
            
            if (!userRecord) {
                throw CustomError.unauthorized("Invalid credentials");
            }

            const {...props} = UserEntity.fromObject(userRecord);
            
            return {
                ...props,
                token: "fake-jwt-token"
            };
        } catch (error) {
            console.log("Error during login:", error);
            
            if (error.code === "auth/user-not-found") {
                throw CustomError.unauthorized("Invalid credentials");
            }
            if (error.code === "auth/invalid-email") {
                throw CustomError.badRequest("Invalid email format");
            }
            if (error instanceof CustomError) {
                throw error;
            }
            
            throw CustomError.internalServer("Login failed");
        }
    }
}
module.exports = AuthService;
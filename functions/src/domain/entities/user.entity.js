const CustomError = require("../errors/custom.error");

// user.entity.js
class UserEntity{
    constructor(
        id,
        name,
        email,
        emailValidated,
        role,
        img
    ){
        this.id = id;
        this.name = name;
        this.email = email;
        this.emailValidated = emailValidated;
        this.role = role;
        this.img = img;
    }

    static fromObject(object){
        const {uid,displayName, email} = object;

        if (!uid) throw CustomError.badRequest("User ID is required");
        if (!displayName) throw CustomError.badRequest("User name is required");
        if (!email) throw CustomError.badRequest("User email is required");
     
        return new UserEntity(
            uid,
            displayName,
            email,
            false,
            ["admin"],
            null
        );
    }

  
}
module.exports = UserEntity;
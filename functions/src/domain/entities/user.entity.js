const CustomError = require("../errors/custom.error");

// user.entity.js
class UserEntity{
    constructor(
        id,
        name,
        email,
        emailValidated,
        password,
        role,
        img
    ){
        this.id = id;
        this.name = name;
        this.email = email;
        this.emailValidated = emailValidated;
        this.password = password;
        this.role = role;
        this.img = img;
    }
    static fromObject(object){
        const {id, _id,name, email, emailValidated, password, role, img} = object;

        if (!id && !_id) throw CustomError.badRequest("User ID is required");
        if (!name) throw CustomError.badRequest("User name is required");
        if (!email) throw CustomError.badRequest("User email is required");
        if(emailValidated === undefined) throw CustomError.badRequest("Missing email validation");
        if (!password) throw CustomError.badRequest("User password is required");
        if (!role) throw CustomError.badRequest("User role is required");

        return new UserEntity(id, name, email, emailValidated, password, role, img);
    }

  
}
module.exports = UserEntity;
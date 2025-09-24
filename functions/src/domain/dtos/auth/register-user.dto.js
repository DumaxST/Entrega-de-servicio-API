const { regularExps } = require("../../../config");

class RegisterUserDto{
    constructor({ email, password, name }) {
        this.email = email;
        this.password = password;
        this.name = name;
    }
    static create(obj){
        const { email, password, name } = obj;

        if (!name) return ["Name is required"];
        if (!regularExps.email.test(email)) return ["Email is invalid"];
        if (!password) return ["Password is required"];
        if( password.length < 6) return ["Password must be at least 6 characters long"];
        
        return [undefined, new RegisterUserDto({ email, password, name })]
    }

}
module.exports = RegisterUserDto;
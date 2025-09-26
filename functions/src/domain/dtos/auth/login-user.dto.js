const { regularExps } = require("../../../config");

class LoginUserDto{
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
    }
    static create(obj){
        const { email, password } = obj;

        if (!email) return ["Email is required"];
        if (!regularExps.email.test(email)) return ["Email is invalid"];
        if (!password) return ["Password is required"];
        
        return [undefined, new LoginUserDto({ email, password })]
    }
}

module.exports = LoginUserDto;
const { Router } = require("express");
const AuthRoutes = require("./auth/routes");

class AppRoutes {
    static  get routes(){
        const router = Router();
      

       router.use("/api/auth", AuthRoutes.routes)

        return router;
    }

}

module.exports = AppRoutes;
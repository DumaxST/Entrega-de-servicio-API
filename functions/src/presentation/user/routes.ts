import { Router } from "express";
import { UserController } from "./controller";

export class UserRoutes{
     static get routes(): Router {
            const router = Router();
            const userController = new UserController();

            router.post("/users", userController.createUser);
            router.get("/users/:id", userController.getUser);
            router.put("/users/:id", userController.updateUser);
            router.delete("/users/:id", userController.deleteUser);

            return router;
     }
}
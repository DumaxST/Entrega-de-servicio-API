import { Router } from "express";
import { UserController } from "./controller";
import { UserDataSourceImp } from "../../infrastructure/datasource/user.datasource.imp";
import { UserRepositoryImp } from "../../infrastructure/repositories/user.repository.imp";

export class UserRoutes {
    static get routes(): Router {
        const router = Router();

        const dataSource = new UserDataSourceImp();
        const userRepository = new UserRepositoryImp(dataSource);
        const userController = new UserController(userRepository);

        // All routes are relative to /users
        router.get("/", userController.getUsers);
        router.post("/", userController.createUser);
        router.get("/:userId", userController.getUserById);
        router.put("/:userId", userController.updateUser);
        router.delete("/:userId", userController.deleteUser);

        return router;
    }
}

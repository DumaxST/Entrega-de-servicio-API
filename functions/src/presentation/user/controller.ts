import { Request, Response } from "express";
import { CreateUserDTO, UpdateUserDTO } from "../../domain/dtos/users";
import { UserRepository } from "../../domain/repositories/user.repository";
import {
    CreateUser,
    GetUser,
    GetUsers,
    UpdateUser,
    DeleteUser
} from "../../domain/use-cases/user";

export class UserController {
    constructor(private readonly userRepository: UserRepository) { }

    public getUsers = (req: Request, res: Response) => {
        const { role } = req.query;

        const filters: any = {};
        if (role) filters.role = role;

        return new GetUsers(this.userRepository)
            .execute(filters)
            .then((users) => {
                return res.status(200).json({ users });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public getUserById = (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "Error: Se requiere el User ID." });
        }

        return new GetUser(this.userRepository)
            .execute(userId)
            .then((user) => {
                return res.status(200).json({ user });
            })
            .catch((error) => {
                return res.status(404).json({ message: `Error: ${error}` });
            });
    };

    public createUser = (req: Request, res: Response) => {
        const [error, createUserDto] = CreateUserDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new CreateUser(this.userRepository)
            .execute(createUserDto!)
            .then((newUser) => {
                return res.status(201).json({ newUser });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public updateUser = (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "Error: Se requiere el User ID." });
        }

        const [error, updateUserDto] = UpdateUserDTO.create({
            id: userId,
            ...req.body
        });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdateUser(this.userRepository)
            .execute(userId, updateUserDto!)
            .then((updatedUser) => {
                return res.status(200).json({ updatedUser });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public deleteUser = (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "Error: Se requiere el User ID." });
        }

        return new DeleteUser(this.userRepository)
            .execute(userId)
            .then(() => {
                return res.status(200).json({
                    message: "Usuario eliminado correctamente.",
                    userId
                });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };
}

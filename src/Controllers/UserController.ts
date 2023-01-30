import { NextFunction, Request, Response } from "express";
import { db } from "../Library/db";

const createUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

const readUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

const readAll = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

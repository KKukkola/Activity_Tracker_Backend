import { NextFunction, Request, Response } from "express";

const createUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;
    
}
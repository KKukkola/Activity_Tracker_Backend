import { NextFunction, Request, Response } from "express";
import { db } from "../Library/db";
import User from "../Models/User";

const createUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

    const user : User = { 
        name: name,
        id: id
    };
    
    db.query("INSERT INTO users VALUES(?,?)", [id, name],
    function(error, results) {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ user });
        }
    });
    
}

const readUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

}

const readAll = (req: Request, res: Response, next: NextFunction) => {
    db.query(`SELECT * FROM users;`, (error, results) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ results });
        }
    });
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {

}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    db.query(`DELETE FROM users WHERE id=?`, userId,
    function(error, results) {
        if (error) {
            res.status(500).json({ error });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: "Entry not found" });
        } else {
            res.status(200).json({ message: "Deleted" });
        }
    });
}

export default { createUser, readUser, readAll, updateUser, deleteUser };
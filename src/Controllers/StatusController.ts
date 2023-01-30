import { NextFunction, Request, Response } from "express";
import { db } from "../Library/db";
import Status from "../Models/Status";

const createStatus = (req: Request, res: Response, next: NextFunction) => {
    const { name, id } = req.body;

    // const status : Status = { 
    //     name: name,
    //     id: id
    // };
    
    // db.query("INSERT INTO statuses VALUES(?,?)", [id, name],
    // function(error, results) {
    //     if (error) {
    //         res.status(500).json({ error });
    //     } else {
    //         res.status(201).json({ status });
    //     }
    // });
    
}

const readStatus = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.userId;

    // db.query(`SELECT * FROM statuses WHERE id=?`, id,
    // function(err, results) {
    //     console.log(results);
    //     if (err) {
    //         res.status(500).json({ err });
    //     } else {
    //         res.status(200).json( results[0] );
    //     }
    // })

}

const readAll = (req: Request, res: Response, next: NextFunction) => {
    db.query(`SELECT * FROM statuses;`, (error, results) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ results });
        }
    });
}

const updateStatus = (req: Request, res: Response, next: NextFunction) => {
    // Not necessary, statuses are just deleted and re-added
}

const deleteStatus = (req: Request, res: Response, next: NextFunction) => {
    // const userId = req.params.userId;

    // db.query(`DELETE FROM statuses WHERE id=?`, userId,
    // function(error, results) {
    //     if (error) {
    //         res.status(500).json({ error });
    //     } else if (results.affectedRows === 0) {
    //         res.status(404).json({ message: "Entry not found" });
    //     } else {
    //         res.status(200).json({ message: "Deleted" });
    //     }
    // });
}

export default { createStatus, readStatus, readAll, updateStatus, deleteStatus };
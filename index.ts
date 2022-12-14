import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import wsServer from './socket';
import * as db from './db'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.get('/', function(req: Request, res: Response) {
    res.send("Express + TypeScript Server");
})

app.get('/api/users', async function(req: Request, res: Response) {
    try {
        db.GetUsers()
            .then(results => { res.send(results); })
            .catch(err => { res.json({ message: err.message }); })
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
})

app.put('/api/users/:id', function(req: Request, res: Response) {
    // Look up the user 
    // If not existing, 404
    // If bad req, 400
    // Return the updated course
})

app.post('/api/users', function(req: Request, res: Response) {
    try {
        // TODO: make sure that the user actually exists on roblox side (AND GET THE NAME)
        
        const NAME = "NAME";
        db.AddUser(parseInt(req.body.userId))
            .then(results=>res.send({ ...req.body, name: NAME }))
            .catch(err => res.json({ message: err.message }))
    } catch(err) {
        res.json({ message: (err as Error).message });
    }
})

app.delete('/api/users/:id', function(req: Request, res: Response) {
    try {
        db.DeleteUser(parseInt(req.params.id))
            .then(results => res.send(results))
            .catch(err => res.send({ message: err.message }))
    } catch(err) {
        res.send(500).json({ message: (err as Error).message })
    }
})

app.listen(port, () => {
    console.log(`🔔[server]: Server is running at https://localhost:${port}`);
})
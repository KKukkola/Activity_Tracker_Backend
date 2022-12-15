import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import moment from 'moment'
import StartWS from './socket';
import * as db from './db';

dotenv.config();

const FETCH_PRESENCE_DELAY = 7000;

const app: Express = express();
const port = process.env.PORT;

const wsServer = StartWS();

const lastStatuses: any = {};
const lastTimes: any = {};

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
    // Update the user
    // Return the updated user
})

app.post('/api/users', async function(req: Request, res: Response) {
    try {
        // Get the user information from Roblox
        const userData = await GetUserInformation(req.body.userId);
        if (!userData || userData.errors) { res.status(404).json({ message: "failed to retrieve user information" }); return; }
        const userName = userData.name;
        // Add the user to the database
        db.AddUser(parseInt(req.body.userId), userName)
            .then(results=>res.send({ ...req.body, name: userName }))
            .catch(err => res.json({ message: err.message }))
        res.status(200);
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

async function GetUserInformation(userId: Number) {
    console.log("Get User Information: ", userId);
    let response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    let data = await response.json();
    if (response.status != 200) {
        console.error("Failed to Get User Information:", userId, response.status);
        return;
    }
    console.log("Got User Data: ", data, response.status);
    return data;
}

async function FetchPresences(userIds: Array<Number>) {
    let response = await fetch(`https://presence.roblox.com/v1/presence/users/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userIds: userIds
        })
    })
    const data = await response.json();
    if (response.ok) {
        const userPresences = data?.userPresences;
        if (userPresences) {
            let presences: any = {};
            userPresences.forEach((presenceObj: any) => {
                presences[presenceObj.userId] = presenceObj.userPresenceType;
            })
            return presences;
        }
    }
    
    return null;
}

function CreateStatusPayload(userId:Number, currentStatus:Number) {
    
    let lastStatus = lastStatuses[userId.toString()];
    let lastTime = lastTimes[userId.toString()];
    if (lastStatus === undefined) lastStatus = null;
    if (lastTime === undefined) lastTime = null; 

    let nowTime: any = new Date();
    let diffTimeSeconds = lastTime && Math.abs(nowTime - lastTime) / 1000 || null;
    let nowTimeFormatted = moment(nowTime).format("YYYY-MM-DD HH:mm:ss");
    
    let data = {
        userId: userId,
        status: currentStatus,
        lastStatus: lastStatus,
        nowTime: nowTimeFormatted,
        diffTime: diffTimeSeconds
    }
    
    lastStatuses[userId.toString()] = currentStatus;
    lastTimes[userId.toString()] = nowTime;
    
    return data
}

setInterval(function() {
    db.GetUsers().then(async function(users) {
        let userIds = (users as Array<{userId:Number, name:String}>).map(user=>user.userId);
        let presences = await FetchPresences(userIds);
        let payload = JSON.stringify(presences);
        wsServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
        // Store these presences in the database if changes are detected.
        for (const userId in presences) {
            const thisStatus = presences[userId];
            let lastStatus = lastStatuses[userId.toString()];
            if (lastStatus === undefined) lastStatus = null;
            // console.log(thisStatus, lastStatus, thisStatus!=lastStatus);
            if (lastStatus === null || lastStatus != thisStatus) {
                let payload = CreateStatusPayload(parseInt(userId), thisStatus);
                console.log("TODO: store this data: ", payload);
            } 
        } 
    });
}, FETCH_PRESENCE_DELAY);


import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import moment from 'moment'
import StartWS from './socket';
import * as db from './db';

dotenv.config();

const FETCH_PRESENCE_DELAY = 120 * 1000;

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
        UpdateStatuses();
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
})

// app.put('/api/users/:id', function(req: Request, res: Response) {
    
// })

app.post('/api/users', async function(req: Request, res: Response) {
    try {
        // Get the user information from Roblox
        const userData: any = await GetUserInformation(req.body.userId);
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
        res.send(500).json({ message: (err as Error).message });
    }
})

app.get('/api/logged/today/:id', function(req: Request, res: Response) {
    try {
        const today = GetTodayDate();
        db.GetTimeFrame(parseInt(req.params.id), today)
            .then(results => res.send(results))
            .catch(err => res.send({ message: err.message }));
    } catch(err) {
        res.send(500).json({ message: (err as Error).message });
    }
})

app.listen(port, () => {
    console.log(`🔔[server]: Server is running at https://localhost:${port}`);
})


function GetTodayDate() {
    let thisDate = new Date();
    let year = thisDate.getFullYear();
    let month = thisDate.getMonth() + 1;
    let day = thisDate.getDate();

    let monthText = String(month).padStart(2, '0');
    let dayText = String(day).padStart(2, '0');
    
    return {
        minDate: `${year}/${monthText}/${dayText} 00:00:00`,
        maxDate: `${year}/${monthText}/${dayText} 23:59:59`
    }
}


async function GetUserInformation(userId: Number) {
    console.log("Get User Information: ", userId);
    return new Promise((resolve, reject) => {
        fetch(`https://users.roblox.com/v1/users/${userId}`)
        .then(response => {
            response.json()
                .then(data=>{ resolve(data); })
                .catch(err=>{ reject(err); })
        })
        .catch(err => { reject(err); });
    })
}

async function FetchPresences(userIds: Array<Number>) {
    return new Promise((resolve, reject) => {
        fetch(`https://presence.roblox.com/v1/presence/users/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userIds: userIds
            })
        })
        .then(response => {
            response.json()
                .then(data => {
                    const userPresences = data?.userPresences;
                    if (userPresences) {
                        let presences: any = {};
                        userPresences.forEach((presenceObj: any) => {
                            presences[presenceObj.userId] = presenceObj.userPresenceType;
                        })
                        resolve(presences);
                    }
                })
                .catch(err => reject(err)) 
        })
        .catch(err => reject(err))
    })
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

function UpdateStatuses() {
    db.GetUsers().then(async function(users) {
        let userIds = (users as Array<{userId:Number, name:String}>).map(user=>user.userId);
        let presences:any = await FetchPresences(userIds);
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
            if (lastStatus === null || lastStatus != thisStatus) {
                let payload = CreateStatusPayload(parseInt(userId), thisStatus);
                db.LogStatus(payload);
                console.log("saved data: ", payload);
            } 
        } 
    });
}

setInterval(function() {
    UpdateStatuses();
}, FETCH_PRESENCE_DELAY);


import mysql from 'mysql'
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'testuser',
    password: 'Password33',
    database: 'activity_db'
})

export function GetUsers() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users;`, 
        function(err, results, fields) {
            return err ? reject(err) : resolve(results);
        });
    })
}

export function AddUser(userId: Number, userName: String) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO users VALUES(?,?)", [userId, userName], 
        function(err, results, fields) {
            return err ? reject(err) : resolve(results);
        });
    })
}

export function DeleteUser(userId: Number) {
    return new Promise((resolve, reject) => {
        connection.query("DELETE FROM users WHERE userId = ?", userId,
        function(err, results, fields) {
            return err ? reject(err) : resolve(results);
        });
    })
}

export function LogStatus(data: any) {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO logged VALUES (?,?,?,?,?);`,
        [data.userId, data.nowTime, data.status, data.lastStatus, data.diffTime],
        function(err, results, fields) {
            return err ? reject(err) : resolve(results);
        });
    })
}

export function GetTimeFrame(userId:number, today: any) {
    return new Promise((resolve, reject) => {
        connection.query(`CALL Query_User_Between (?,?,?);`,
        [userId, today.minDate, today.maxDate],
        function (err, results, fields) {
            return err ? reject(err) : resolve(results);
        })
    })
}






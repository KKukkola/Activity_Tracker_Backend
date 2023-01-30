import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config(); // Load into process.env

const MYSQL_HOST = process.env.MYSQL_HOST || '';
const MYSQL_USERNAME = process.env.MYSQL_USERNAME || '';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DB = process.env.MYSQL_DB || '';

export const db = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB,
})

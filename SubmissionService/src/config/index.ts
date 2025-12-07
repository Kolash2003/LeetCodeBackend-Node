// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    DB_URI: string,
    PROBLEM_SERVICE: string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    DB_URI: process.env.DB_URI || "mongodb://localhost:27017/lc_submission_db",
    PROBLEM_SERVICE: process.env.PROBLEM_SERVICE || "http://localhost:3000/api/v1"
};
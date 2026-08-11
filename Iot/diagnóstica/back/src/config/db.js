import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
    host: process.env.HOST,
    port: Number(process.env.PORT),
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60,
})
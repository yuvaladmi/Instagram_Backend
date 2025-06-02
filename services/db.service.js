import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = { getCollection }

var dbConn = null

async function getCollection(collectionName) {
    try { 
        console.log("Connecting to:", process.env.DB_URL)
        console.log("Connecting to:", process.env.DB_NAME)

        const db = await _connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}

async function _connect() {
    if (dbConn) return dbConn

    try {
        const client = new MongoClient(config.dbURL) // 👈 יצירת מופע
        await client.connect() 
        console.log('✅ Connected to MongoDB')
        return dbConn = client.db(config.dbName)
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}
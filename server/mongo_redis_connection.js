const { MongoClient, Db } = require('mongodb');
const { createClient } = require('redis');
require('dotenv').config();


const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
client.on("error", (err) => console.error("Mongo error", err))
let db = null;

const redisClient = createClient()
redisClient.on('error', (err) => console.error("Redis error ", err))

/**
 *
 * @returns {Db}
 */
function connectToDatabase() {
    if (!db) {
        try {
            db = client.db("test");
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('Error connecting to MongoDB', err);
            throw err;
        }
    }
    return db;
}
/**
 * 
 * @returns {Promise<RedisClientType>}
 */
async function connectToRedis() {
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect()
            console.log('Connected to Redis');
        } catch (err) {
            console.error('Error connecting to Redis', err);
            throw err;
        }
    }
    return redisClient
}

module.exports = { connectToDatabase, connectToRedis };
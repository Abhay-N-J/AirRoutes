import { MongoClient, Db } from 'mongodb';
import { createClient } from 'redis';
import { mongo_uri, redis_uri } from '../config/config.js';


const client = new MongoClient(mongo_uri);
client.on("error", (err) => console.error("Mongo error", err))
let db = null;

const redisClient = createClient({
    url: redis_uri,
})
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

export { connectToDatabase, connectToRedis };
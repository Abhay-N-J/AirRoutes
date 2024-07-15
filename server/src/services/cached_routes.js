import { getRoutes, getAllRoutes, findRoutes, getAirports } from './data_routes.js';
import { connectToRedis } from '../utils/mongo_redis_connection.js';

/**
 * 
 * @param {string} srcCode 
 * @param {string} dstCode 
 * @param {boolean} bypass 
 * @returns {Promise<Document[]>}
 * @deprecated
 */
async function cachedRoutes(srcCode, dstCode, bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `routes_${srcCode}_${dstCode}`
    const cacheRoutes = await redisClient.get(cacheKey)
    
    if (!bypass && cacheRoutes) {
        return JSON.parse(cacheRoutes)
    } else {
        const routes = await getRoutes(srcCode, dstCode);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(routes));
        return routes;
    }
}

/**
 * 
 * @param {boolean} bypass 
 * @returns {Promise<{}>}
 */
async function cachedAllRoutes(bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `routes`
    const cacheRoutes = await redisClient.get(cacheKey)
    
    if (!bypass && cacheRoutes) {
        return JSON.parse(cacheRoutes)
    } else {
        const routes = await getAllRoutes();
        const graph = makeGraph(routes)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(graph));
        return graph;
    }
}

/**
 * 
 * @param {string} srcCode 
 * @param {string} dstCode 
 * @param {number} maxHops 
 * @param {boolean} bypass 
 * @returns {Promise<any[]>}
 */
async function cachedFindRoutes(srcCode, dstCode, maxHops = 3, bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `routes_${srcCode}_${dstCode}_${maxHops}`
    const cacheRoutes = await redisClient.get(cacheKey)
    
    if (!bypass && cacheRoutes) {
        return JSON.parse(cacheRoutes)
    } else {
        const routes = await findRoutes(await cachedAllRoutes(bypass), srcCode, dstCode, maxHops);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(routes));
        return routes;
    }
}

/**
 * 
 * @returns {Promise<any[]>}
 */
async function cachedAirports(bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `airports`
    const cacheAirports = await redisClient.get(cacheKey)
    
    if (!bypass && cacheAirports) {
        return JSON.parse(cacheAirports)
    } else {
        const airports = await getAirports();
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(airports));
        return airports;
    }
}


/**
 * 
 * @param {Document[]} routes 
 * @returns {{}}
 */
function makeGraph(routes) {
    let graph = {}
    routes.forEach((doc, _) => {
        if (!graph[doc.sourceAirportId]) {
            graph[doc.sourceAirportId] = []
        }
        graph[doc.sourceAirportId].push({
            destinationAirportId: doc.destinationAirportId,
            destinationAirport: doc.destinationAirport,
            airline: doc.airline,
            stops: doc.stops,
        })
    })
    return graph
}


export { cachedRoutes, cachedAllRoutes, cachedFindRoutes, cachedAirports }
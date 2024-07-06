const { getRoutes, getAllRoutes, findRoutes } = require('./data_routes');
const { connectToRedis } = require('./mongo_redis_connection');

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
    const cacheKey = `routes_${srcCode}_${dstCode}`
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


module.exports = { cachedRoutes, cachedAllRoutes, cachedFindRoutes }
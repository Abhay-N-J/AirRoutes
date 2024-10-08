import { getRoutes, getAllRoutes, findRoutes, getAirports, getAllAirports, getAllAirplanes, getLatLong } from './data_routes.js';
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
        const airports = await getAllAirports();
        const airlines = await getAllAirplanes();
        const graph = makeGraph(routes, airports, airlines)
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
 * @param {WithId<Document>} routes 
 * @param {Promise<{int: WithId<Document>}} airports
 * @param {Promise<{int: WithId<Document>}} airplanes
 * @returns {{}}
 */
function makeGraph(routes, airports, airplanes) {
    let graph = {}
    routes = routes.map((route, _) => ({
        ...route,
        airlineName: airplanes[route.airline]?.name,
        destinationAirportName: airports[route.destinationAirport]?.name,
        latitude: airports[route.destinationAirport]?.latitude,
        longitude: airports[route.destinationAirport]?.longitude
    }))
    routes.forEach((doc, _) => {
        const sourceKey = doc.sourceAirport;
        if (!graph[sourceKey]) {
            graph[sourceKey] = []
        }
        graph[sourceKey].push({
            airportCode: doc.destinationAirport,
            airportName: doc.destinationAirportName,
            latitude: doc.latitude,
            longitude: doc.longitude,
            airline: doc.airline,
            airlineName: doc.airlineName,
            stops: doc.stops,
        })
    })

    return graph
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
 * @returns {Promise<any[]>}
 */
async function cachedAllAirports(bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `all_airports`
    const cacheAirports = await redisClient.get(cacheKey)
    
    if (!bypass && cacheAirports) {
        return JSON.parse(cacheAirports)
    } else {
        const airports = await getAllAirports();
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(airports));
        return airports;
    }
}

/**
 * @param {boolean} bypass
 * @returns {Promise<any[]>}
 */
async function cachedGetLatLong(bypass = false) {
    const redisClient = await connectToRedis()
    const cacheKey = `airport_lat_long`
    const cacheAirports = await redisClient.get(cacheKey)
    
    if (!bypass && cacheAirports) {
        return JSON.parse(cacheAirports)
    } else {
        const airports = await getLatLong()
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(airports))
        return airports
    }
}





export { cachedRoutes, cachedAllRoutes, cachedFindRoutes, cachedAirports, cachedAllAirports, cachedGetLatLong }
import { cachedAirports, cachedAllAirports, cachedAllRoutes, cachedFindRoutes } from "../services/cached_routes.js"
import { getRealtimeRoutes } from "../services/data_routes.js";
import { connectToRedis } from "../utils/mongo_redis_connection.js";
import { calculateDistance } from "../utils/utils.js";
import { createHash } from "crypto"

const searchRoutes = async (req, res, next) => {
    try {
        let { src, dst, hops } = req.params;
        let { airlines, airports, sortDist, page } = req.query;
        page = parseInt(page)
        hops = parseInt(hops)
        airlines = new Map(Object.entries(JSON.parse(airlines)))
        airports = new Map(Object.entries(JSON.parse(airports)))
        let routes = await cachedFindRoutes(src, dst, hops)
        const newAirlines = new Map(airlines)
        const newAirports = new Map(airports)
        routes = routes.filter((routeArray, index) => {
            const route = routeArray[0];
            const airportsPerRoute = [];
            const coords = [];
            const airlinesPerRoute = new Set();
            let exit = false
            route.forEach((r, i) => {    
              if (exit || airports.get(r.airportName) === false || airlines.get(r.airlineName) === false) {
                exit = true
                return
              }
              airportsPerRoute.push(r.airportCode);
              if (
                r.latitude != null &&
                r.longitude != null &&
                r.airportCode != null
              )
                coords.push({
                  position: [r.latitude, r.longitude],
                  popupText: r.airportCode + ", " + r.airportName,
                });
              if (i != 0 && i != route.length - 1)
                  newAirports.set(r.airportName, true)
              if (i != 0) {
                newAirlines.set(r.airlineName, true)
                airlinesPerRoute.add(r.airlineName);
              }
            });
            routeArray.push(airportsPerRoute, [...airlinesPerRoute], coords)
            if (!exit)
                return routeArray
        }) 
        if (sortDist == "true")
            routes.sort((a, b) => a[2] - b[2])
        else
            routes.sort((a, b) => a[1] - b[1])
        res.status(200).json({ 
            routes: routes.slice((page - 1) * 10, page * 10), 
            airports: Object.fromEntries(newAirports), 
            airlines: Object.fromEntries(newAirlines), 
            totalPages: Math.ceil(routes.length / 9), 
            page: page 
        })
    } catch(err) {
        next(err)
    }
}

const realtimeRoutes = async (req, res, next) => {
    try {
        let { src, dst, hops } = req.params;
        let { airlines, airports, sortDist, date, page } = req.body;
        page = parseInt(page);
        hops = parseInt(hops)
        const data = `${src}-${dst}-${hops}-${JSON.stringify(airlines)}-${JSON.stringify(airports)}`;
        const hash = createHash('sha256').update(data).digest('hex');
        const redisClient = await connectToRedis()
        let routes = []
        if (await redisClient.exists(hash)) {            
            routes = JSON.parse(await redisClient.get(hash))
        } else {
            airlines = new Map(Object.entries(airlines))
            airports = new Map(Object.entries(airports))
            
            const { Newroutes, Newairlines, Newairports } = await getRealtimeRoutes(src, dst, date, airlines, airports, hops)
            routes = Newroutes
            await redisClient.setEx(hash, 3600, JSON.stringify(routes))
            airlines = Object.fromEntries(Newairlines);
            airports = Object.fromEntries(Newairports);
        }
        if (sortDist == "1")
            routes.sort((a, b) => a[2] - b[2])
        else if (sortDist == "2")
            routes.sort((a, b) => a[1] - b[1])
        else
            routes.sort((a, b) => a[6] - b[6])
        res.status(200).json({ 
            routes:  routes.slice((page - 1) * 10, page * 10), 
            airlines: airlines, 
            airports: airports, 
            totalPages: Math.ceil(routes.length / 9), 
            page: page 
        })
    } catch (err) {
        next(err)
    }
}

const directRoutes = async (req, res, next) => {
    try {
        const routes = await cachedAllRoutes()
        const airports = await cachedAllAirports();
        res.status(200).json({ routes: routes, airports: airports })
    } catch (err) {
        next(err)
    }
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @deprecated 
 */
const searchRoutesWithDistance = async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        let routes = await cachedFindRoutes(src, dst, hops)
        routes = routes.map((route, _) => {
            let distance = 0;
            let latPrev = null;
            let longPrev = null
            for (const airport of route[0]) {
                if (latPrev !== null) {
                    distance += calculateDistance(latPrev, longPrev, airport.latitude, airport.longitude)  
                }
                latPrev = airport.latitude;
                longPrev = airport.longitude 
            }
            route.push(distance.toFixed(2))
            return route;
        })
        routes.sort((a, b) => a[2] - b[2])
        res.status(200).json({ routes: routes })
    } catch(err) {
        next(err)
    }
}

const airports = async (req, res, next) => {
    try {
        const airports = await cachedAirports()
        res.status(200).json({ airports: airports })
    } catch(err) {
        next(err)
    }
}

export { searchRoutes, airports, searchRoutesWithDistance, directRoutes, realtimeRoutes }
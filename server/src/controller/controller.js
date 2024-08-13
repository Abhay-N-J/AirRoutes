import { cachedAirports, cachedAllAirports, cachedAllRoutes, cachedFindRoutes } from "../services/cached_routes.js"
import { getRealtimeRoutes } from "../services/data_routes.js";
import { calculateDistance } from "../utils/utils.js";

const searchRoutes = async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        let { airlines, airports, sortDist } = req.body;
        airlines = new Map(Object.entries(airlines))
        airports = new Map(Object.entries(airports))
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
        if (sortDist)
            routes.sort((a, b) => a[2] - b[2])
        else
            routes.sort((a, b) => a[1] - b[1])
        res.status(200).json({ routes: routes, airports: Object.fromEntries(newAirports), airlines: Object.fromEntries(newAirlines) })
    } catch(err) {
        next(err)
    }
}

const realtimeRoutes = async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        let { airlines, airports, sortDist, date } = req.body;
        airlines = new Map(Object.entries(airlines))
        airports = new Map(Object.entries(airports))
        const newAirlines = new Map(airlines)
        const newAirports = new Map(airports)
        const routesJson = await getRealtimeRoutes(src, dst, date, parseInt(hops))
        
        res.status(200).json({ routes: routesJson })
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
import { cachedAirports, cachedAllAirports, cachedAllRoutes, cachedFindRoutes } from "../services/cached_routes.js"
import { calculateDistance } from "../utils/utils.js";

const searchRoutes = async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        const routes = await cachedFindRoutes(src, dst, hops)
        routes.sort((a, b) => a[1] - b[1])
        res.status(200).json({ routes: routes })
    } catch(err) {
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

export { searchRoutes, airports, searchRoutesWithDistance, directRoutes }
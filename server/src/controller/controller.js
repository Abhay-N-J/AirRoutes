import { cachedAirports, cachedFindRoutes } from "../services/cached_routes.js"

const searchRoutes = async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        const routes = await cachedFindRoutes(src, dst, hops)
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

export { searchRoutes, airports }
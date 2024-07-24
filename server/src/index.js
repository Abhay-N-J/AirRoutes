import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import { port } from './config/config.js';
import { cachedAllRoutes } from './services/cached_routes.js';
const app = express()

app.use(cors())

// async function main() {
//     const routes = await cachedFindRoutes("AER", "KZN", 5)
//     for (let route of routes) {
//         console.log(route);
//     }
// }
// main()

app.use(async (req, res, next) => {
    const now = new Date()
    if (process.env.PROD !== true)
        console.log("Called: " + req.url + ` at ${now.toUTCString()}`)
    next()
})

app.get('/', async (req, res) => {
    res.json({"Home": "Server"})
})

app.use('/', router)

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        "error": "server error"
    })
})

app.listen(port, 
    () => console.log(`Server running on ${port}`))

cachedAllRoutes()
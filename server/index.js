const express = require("express")
const { cachedFindRoutes } = require("./redis");

const app = express()



async function main() {
    const routes = await cachedFindRoutes("AER", "KZN", 5)
    for (let route of routes) {
        console.log(route);
    }
}

// main()

app.get('/', async (req, res) => {
    res.json({"Home": "Server"})
})


// TODO: Make SSE version of this to test speed in frontend with yield in findRoutes()
app.get('/:src/:dst/:hops?', async (req, res, next) => {
    try {
        const { src, dst, hops } = req.params;
        const routes = await cachedFindRoutes(src, dst, hops)
        res.status(200).json({ routes: routes })
    } catch(err) {
        next(err)
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        "error": "server error"
    })
})

app.listen(process.env.PORT || 9090, 
    () => console.log(`Server running`))


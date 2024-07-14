const express = require("express")
const { cachedFindRoutes, cachedAirports } = require("./redis");
const cors = require('cors');
const app = express()

app.use(cors())

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

app.get('/airports', async (req, res, next) => {
    try {
        const airports = await cachedAirports()
        res.status(200).json({ airports: airports })
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

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}
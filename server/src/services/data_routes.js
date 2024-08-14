import { Db } from "mongodb"
import { connectToDatabase }  from "../utils/mongo_redis_connection.js"
import { calculateDistance } from "../utils/utils.js"
import { getJson } from 'serpapi';
import { serp_api_key } from "../config/config.js";
import { cachedGetLatLong } from "./cached_routes.js";

/**
 * 
 * @param {Db} db 
 * @returns {Promise<any[]>}
 */
async function getAllRoutes(db = null) {
    if (!db)
        db = connectToDatabase()
    const coll = db.collection("routes")
    const cursor = coll.find().project({ 
        _id: 0,  
        airline: 1,
        airlineId: 1,
        sourceAirport: 1,
        sourceAirportId: 1,
        destinationAirport: 1,
        destinationAirportId: 1,
        stops: 1,
    })
    
    var routes = []
    for await (const doc of cursor) {
        routes.push(doc)
    }
    return routes
}


/**
 * 
 * @param {Db} db 
 * @returns {Promise<{ int: WithId<Document> }>}
 */
async function getAllAirports(db = null) {
    if (!db)
        db = connectToDatabase();
    const coll = db.collection("airports")
    const cursor = coll.find().project({ 
        name: 1,
        city: 1,
        country: 1,
        IATA: 1,
        ICAO: 1,
        latitude: 1,
        longitude: 1,
    })
    var airports = {}
    for await (const doc of cursor) {
        airports[doc.IATA ?? doc.ICAO] = doc
    }
    return airports
}


/**
 * 
 * @param {Db} db 
 * @returns {Promise<{ int: WithId<Document> }>}
 */
async function getAllAirplanes(db = null) {
    if (!db)
        db = connectToDatabase();
    const coll = db.collection("airlines")
    const cursor = coll.find()
    var planes = {}
    for await (const doc of cursor) {
        planes[doc.IATA ?? doc.ICAO] = doc
    }
    return planes
}

/**
 * 
 * @param {String} srcCode 
 * @param {String} dstCode 
 * @param {String} maxHops 
 * @returns {Promise<any[]>}
 * @deprecated
 */
async function getRoutes(srcCode, dstCode, maxHops = 3) {
    try {
        const db = connectToDatabase()
        const routesCollection = db.collection("routes")

        let directConnection = await routesCollection.find({
            sourceAirport: srcCode,
            destinationAirport: dstCode
        }).toArray();
        
        // Step 2: Find multiple hop connections
        let pipeline = [
            {
                $match: {
                    sourceAirport: srcCode
                }
            },
            {
                $graphLookup: {
                    from: 'routes',
                    startWith: '$destinationAirport',
                    connectFromField: 'destinationAirport',
                    connectToField: 'sourceAirport',
                    as: 'connections',
                    maxDepth: maxHops
                }
            },
            {
                $match: {
                    'connections.destinationAirport': dstCode
                }
            }
        ];
        console.log("Direct done");
        let multipleHopConnections = await routesCollection.aggregate(pipeline).toArray();
        
        // Step 3: Format the output as per your requirement
        let output = [];
        if (directConnection.length > 0) {
            output.push("Direct connection: ", directConnection);
        }
        
        if (multipleHopConnections.length > 0) {
            multipleHopConnections.forEach((doc, index) => {
                output.push(`Multiple hop connection ${index + 1}: `, doc.connections);
            });
        }
        
        return output

    } catch (err) {
        console.error(err);
    }
}

/**
 * 
 * @param {String} code 
 * @returns {Promise<String> | Promise<Error> }
 * @deprecated
 */
async function getAirportId(code) {
    const db = connectToDatabase()
    const airportsCollection = db.collection("airports")
    const doc = await airportsCollection.findOne({$or: [{"IATA": code}, {"ICAO": code}]})
    if (!doc) return Error("Airport Code Not Found")
    return doc.airportId
}

/**
 * 
 * @param {{}} graph 
 * @param {String} srcCode 
 * @param {String} dstCode 
 * @param {number} maxHops 
 * @returns {Promise<any[]>}
 */
async function findRoutes(graph, srcCode, dstCode, maxHops = 3) {
    let result = []
    const db = connectToDatabase()
    const srcInfo = await db.collection("airports").findOne(
        {IATA: srcCode}, 
        {projection: 
            {_id: 0, name: 1, latitude: 1, longitude: 1}
        }
    )
    const bfs = (src, dst, maxHops) => {
        const srcNode = {
            airportCode: srcCode,
            airportName: srcInfo?.name,
            latitude: srcInfo?.latitude,
            longitude: srcInfo?.longitude,
        }
        let prevLat = srcInfo?.latitude
        let prevLong = srcInfo?.longitude
        let distance = 0;
        let queue = [[src, [srcNode], -1, distance]]
        let visited = new Set()

        while (queue.length > 0) {
            let [curr, path, hops, dist] = queue.shift()
            if (hops > maxHops) continue
            if (curr === dst) {
                result.push([path, hops, dist.toFixed(2)])
                continue
            }

            if (!graph[curr]) continue

            for (let neighbor of graph[curr]) {
                let newHops = hops + 1 + neighbor.stops
                let newDist = dist + calculateDistance(prevLat, prevLong, neighbor.latitude ?? prevLat, neighbor.longitude ?? prevLong)
                if (newHops <= maxHops && !visited.has(neighbor)) {
                    visited.add(neighbor)
                    queue.push([neighbor.airportCode, [...path, neighbor], newHops, newDist])
                }
            }
        }
    }

    bfs(srcCode, dstCode, maxHops)
    return result
}


/**
 * @returns {Promise<any[]>}
 */
async function getAirports() {
    const db = connectToDatabase()
    const airportsCollection = db.collection("airports")
    const cursor = airportsCollection.find({}).project({ _id: 0, name: 1, country: 1, IATA: 1, ICAO: 1})
    let airports = []
    for await (const doc of cursor) {
        airports.push(doc)
    }
    airports = airports.map((airport) => ({
        ...airport,
        label: (airport.IATA == null ? airport.ICAO : airport.IATA) + ", " + airport.name + ", " + airport.country
    }))
    return airports
}

/**
 * 
 * @returns {Promise<{}>}
 */
async function getLatLong() {
    const db = connectToDatabase()
    const airportsCollection = db.collection("airports")
    const cursor = airportsCollection.find({})
    let airports = {}
    for await (const doc of cursor) {
        airports[doc.IATA ?? doc.ICAO] = doc
    }
    return airports
}


/**
 * @param {string} src
 * @param {string} dst
 * @param {string} date
 * @param {Map} newAirlines
 * @param {Map} newAirports
 * @param {number} hops
 * @returns {Promise<[]>}
 */
async function getRealtimeRoutes(src, dst, date, newAirlines, newAirports, hops = 1) {
    const SERP_API_KEY = serp_api_key
    const routesJson = await getJson({
        engine: "google_flights",
        type: 2,
        outbound_date: date,
        api_key: SERP_API_KEY,
        departure_id: src,
        arrival_id: dst,
        type: 2,
        show_hidden: true,
        stops: hops > 2? 0: hops + 1,
        exclude_airlines: Array.from(newAirlines.keys())
                            .filter((val) => {
                                return newAirlines.get(val) === false;
                            })
                            .map((val) => {
                                return val.split(" ")[0];
                            })
                            .join(','),
        exclude_conns: Array.from(newAirports.keys())
                                .filter((val) => {
                                if (newAirports.get(val) == false)
                                    return val;
                                })
                                .join(","),
    })
    const { best_flights, other_flights } = routesJson 
    const routes = []
    async function flightDetails(value, index) {
        const airportsCollection = await cachedGetLatLong()
        const { flights, layovers, total_duration } = value
        const route = [[]]
        const planes = new Set()
        const ports = []
        let distance = 0
        const map_locs = []
        let i = 0
        for (const v of flights) {
            const { departure_airport, arrival_airport, airline, flight_number, duration } = v
            const departure = {
                latitude: airportsCollection[departure_airport.id]?.latitude,
                longitude: airportsCollection[departure_airport.id]?.longitude,
            }
            if (i == 0) {
                route[0].push({
                    "airportCode": departure_airport.id,
                    "airportName": departure_airport.name,
                    "departureTime": departure_airport.time,
                    "latitude": departure.latitude,
                    "longitude": departure.longitude,
                })
                map_locs.push({
                    position: [departure.latitude, departure.longitude],
                    popupText: departure_airport.name
                })
                ports.push(departure_airport.id)
            }
            ports.push(arrival_airport.id)
            if (i != flights.length - 1) {
                newAirports.set(arrival_airport.id, true)
            }
            planes.add(`${flight_number.split(" ")[0]} ${airline}`)
            newAirlines.set(`${flight_number.split(" ")[0]} ${airline}`, true)
            const arrival = {
                latitude: airportsCollection[arrival_airport.id]?.latitude,
                longitude: airportsCollection[arrival_airport.id]?.longitude,
            }
            route[0].push({
                "airportCode": arrival_airport.id,
                "airportName": arrival_airport.name,
                "arrivalTime": arrival_airport.time,
                "longitude": arrival.latitude,
                "longitude": arrival.longitude,
                "airline": flight_number,
                "airlineName": airline,
                "duration": duration,
            })
            map_locs.push({
                position: [arrival.latitude, arrival.longitude],
                popupText: arrival_airport.name
            })
            distance += calculateDistance(departure.latitude, departure.longitude, arrival.latitude, arrival.longitude)
            i++
        }
        route.push(layovers?.length ?? 0)
        route.push(distance.toFixed(2))
        route.push(Array.from(ports))
        route.push(Array.from(planes))
        route.push(map_locs)
        route.push(total_duration)
        routes.push(route)
    }
    if (best_flights != undefined) {
        for (const value of best_flights) {
            await flightDetails(value, 0)
        }
    }
    if (other_flights != undefined) {
        for (const value of other_flights) {
            await flightDetails(value, 0)
        }
    }
    return routes
}



export { getAllRoutes, getAllAirplanes, getAllAirports, getRoutes, findRoutes, getAirports, getRealtimeRoutes, getLatLong }
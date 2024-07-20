import { Db } from "mongodb"
import { connectToDatabase }  from "../utils/mongo_redis_connection.js"

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
        airportId: 1,
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
        airports[doc.airportId] = doc
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
        planes[doc.airlineId] = doc
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
    const src = await getAirportId(srcCode)
    const dst = await getAirportId(dstCode)
    const db = connectToDatabase()
    const srcInfo = await db.collection("airports").findOne(
        {airportId: src}, 
        {projection: 
            {_id: 0, airportId: 1, city: 1, latitude: 1, longitude: 1}
        }
    )
    const bfs = (src, dst, maxHops) => {
        const srcNode = {
            airportId: srcInfo?.airportId,
            airportCode: srcCode,
            airportName: srcInfo?.city,
            latitude: srcInfo?.latitude,
            longitude: srcInfo?.longitude,
        }
        let queue = [[src, [srcNode], -1]]
        let visited = new Set()

        while (queue.length > 0) {
            let [curr, path, hops] = queue.shift()
            if (hops > maxHops) continue
            if (curr === dst) {
                result.push([path, hops])
                continue
            }

            if (!graph[curr]) continue

            for (let neighbor of graph[curr]) {
                let newHops = hops + 1 + neighbor.stops

                if (newHops <= maxHops && !visited.has(neighbor)) {
                    visited.add(neighbor)
                    queue.push([neighbor.airportId, [...path, neighbor], newHops])
                }
            }
        }
    }

    bfs(src, dst, maxHops)
    return result
}


/**
 * @returns {Promise<any[]>}
 */
async function getAirports() {
    const db = connectToDatabase()
    const airportsCollection = db.collection("airports")
    const cursor = airportsCollection.find({}).project({ _id: 0, city: 1, country: 1, IATA: 1, ICAO: 1})
    let airports = []
    for await (const doc of cursor) {
        airports.push(doc)
    }
    airports = airports.map((airport) => ({
        ...airport,
        label: airport.city + ", " + airport.country + ', ' + (airport.IATA == null ? airport.ICAO : airport.IATA)
    }))
    return airports
}


export { getAllRoutes, getAllAirplanes, getAllAirports, getRoutes, findRoutes, getAirports }
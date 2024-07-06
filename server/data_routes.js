const { Db } = require("mongodb")
const { connectToDatabase } = require("./mongo_redis_connection")

/**
 * 
 * @param {Db} db 
 * @returns {Promise<Document[]>}
 */
async function getAllRoutes(db = null) {
    if (!db)
        db = connectToDatabase()
    const coll = db.collection("routes")
    const cursor = coll.find().project({ _id: 0, airlineId: 0, codeshare: 0, equipment: 0, __v: 0 } )
    var routes = []
    for await (const doc of cursor) {
        routes.push(doc)
    }
    return routes
}


/**
 * 
 * @param {Db} db 
 * @returns {{ int: WithId<Document> }}
 */
async function getAllAirports(db) {
    const coll = db.collection("airports")
    const cursor = coll.find()
    var airports = {}
    var index = 1
    for await (const doc of cursor) {
        airports[index++] = doc
        // console.log(doc);
    }
    return airports
}


/**
 * 
 * @param {Db} db 
 * @returns {{ int: WithId<Document> }}
 */
async function getAllAirplanes(db) {
    const coll = db.collection("airlines")
    const cursor = coll.find()
    var planes = {}
    var index = 1
    for await (const doc of cursor) {
        planes[index++] = doc
        // console.log(doc);
    }
    return planes
}

/**
 * 
 * @param {String} srcCode 
 * @param {String} dstCode 
 * @param {String} maxHops 
 * @returns {Promise<Document[]>}
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
    src = await getAirportId(srcCode)
    dst = await getAirportId(dstCode)

    const bfs = (src, dst, maxHops) => {
        let queue = [[src, [srcCode], -1]]
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
                    queue.push([neighbor.destinationAirportId, [...path, neighbor], newHops])
                }
            }
        }
    }

    bfs(src, dst, maxHops)
    return result
}


module.exports = { getAllRoutes, getAllAirplanes, getAllAirports, getRoutes, findRoutes }
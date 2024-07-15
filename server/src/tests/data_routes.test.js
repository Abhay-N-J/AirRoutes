const { mongoose, Schema } = require("mongoose")

require('dotenv').config();


test('mongoose cache testing', async () => { 
    mongoose.connect(process.env.MONGO_URI)
    const db = mongoose.connection
    
    const model = db.model("routes", new Schema({
        airline: String,
        airlineId: Number,
        sourceAirport: String,
        sourceAirportId: Number,
        destinationAirport: String,
        destinationAirportId: Number,
        codeshare: String,
        stops: String,
        equipment: String,
        __v: Number
    }))

    const time_1 = Date.now()
    let route_1 = await model.find({})
    const time_2 = Date.now()
    let route_2 = await model.find({})
    const time_3 = Date.now()
    console.log(route_1.length);
    console.log(route_2.length);
    expect(time_3 - time_2).toBe(time_2 - time_1)
 }, 1000000)

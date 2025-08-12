const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    origin: {
        type: String,
        required: ["Origin station is required"]
    },
    destination: {
        type: String,
        required: ["destination station is required"]
    },
    train_number: {
        type: String,
        required: ["train_number station is required"]
    },
    departure_time: {
        type: String,
        required: ["departure_time station is required"]
    },
    arrival_time: {
        type: String,
        required: ["arrival_time station is required"]
    },
    duration: {
        type: String,
        required: ["duration station is required"]
    },
    date: {
        type: String,
        required: ["date station is required"]
    },

})

const tourModel = mongoose.model("Tours", tourSchema)

module.exports = tourModel
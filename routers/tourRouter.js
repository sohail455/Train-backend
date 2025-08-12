const tourController = require('../controller/tourController')
const express = require('express')
const Router = express.Router()

Router.post("/", tourController.createTour)
Router.get("/", tourController.getAllTours)


module.exports = Router
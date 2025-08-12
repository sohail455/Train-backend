const handleFactory = require('./handleFactory')
const tourModel = require('../model/tourModel')

exports.createTour = handleFactory.CreateOne(tourModel)
exports.getAllTours = handleFactory.GetAll(tourModel)
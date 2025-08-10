const User = require("../model/userModel");
const handleFactory = require("./handleFactory");

exports.CreatNewUser = handleFactory.CreateOne(User);

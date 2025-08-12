const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.CreateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.GetAll = (Model) => catchAsync(async (req, res, next) => {
  const allDocs = await Model.find()
  if (!allDocs) {
    return next(new AppError("There Are No Data"), 400)
  }
  res.status(200).json({
    message: "success",
    data: allDocs
  })
})
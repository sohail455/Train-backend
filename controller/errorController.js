const AppError = require("../utils/appError");

function sendDevError(err, req, res, next) {
  console.log(err);
  return res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack,
  });
}

function sendProdError(err, req, res, next) {
  return res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
  });
}

function handelValidationError(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log(errors);
  const message = errors.join(". ");
  return new AppError(`Invalid Input: ${message} error`, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res, next);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "ValidationError") error = handelValidationError(err);
    sendProdError(error, req, res, next);
  }
};

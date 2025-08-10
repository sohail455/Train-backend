/*******************************************************************************
 *                                     Inclusion
 * *****************************************************************************/
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routers/userRouter");
const globalErrorHandler = require("./controller/errorController");
/*******************************************************************************
 *                                Create Applicttion
 * *****************************************************************************/
//create application
const app = express();
//fixing Cros-Origin Resource Sharing
app.use(cors());
//showing coming requests
app.use(morgan("dev"));
//enabling json
app.use(express.json());
//cookies adding
app.use(cookieParser());
//adding Endpoints
app.use("/api/v1/users", userRouter);

app.use(globalErrorHandler);

module.exports = app;

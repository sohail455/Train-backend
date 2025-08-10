const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app"); // هذا يجب أن يأتي بعد تعريف app في app.js

dotenv.config({ path: "./config.env" });

const DB = process.env.DATA_BASE.replace(
  "PASSWORD",
  process.env.DATA_BASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("Database Connected Successfully")).catch(e => console.log(e.message));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));

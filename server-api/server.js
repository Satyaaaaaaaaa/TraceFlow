const express = require("express");
const app = express();
const cors = require("cors"); // For Cross Origin Resource Sharing
// const Sequelize = require("sequelize"); // For ORM
const morgan = require("morgan"); // For logging
require('dotenv').config();

//TESTING HEADER SIZE
//const http = require('http');
// http.globalAgent.maxHeaderSize = 16384;

const sequelize= require("./common/models/SequelizeInstance");

const { port , ADDRESS } = require("./config");
const PORT = port || 3000;

// Route Imports
const AuthorizationRoutes = require("./authorization/routes");
const UserRoutes = require("./users/routes");
const AddressRoutes = require("./address/routes");
const ProductRoutes = require("./products/routes");
const UploadImageRoutes = require("./common/images/UploadImage");
const OrderRoutes = require("./order/routes");
const CartRoutes = require("./cart/routes");
//const { Cart } = require("./common/models/Cart");
const CategoryRoutes  = require("./Categories/routes") //server-api/Categories/routes.js
//const SearchRoutes = require("./common/meilisearch/routes")
// const traceflowRoutes = require("./traceflowRouters/routes");
// const forgotPasswordRoutes = require("./authorization/routes/forgotPasswordRoutes"); (NOT SURE YET)



app.use(morgan("tiny"));
app.use(cors());

app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static('uploads'));

// Syncing the models that are defined on sequelize with the tables that alredy exists
// in the database. It creates models as tables that do not exist in the DB.
// It also creates the tables if they do not exist.
sequelize
  .sync()
  .then(() => {
    console.log("Sequelize Initialized!");

    // Attaching the Authentication and User Routes to the app
    app.use("/", AuthorizationRoutes);
    app.use("/user", UserRoutes);
    app.use("/address", AddressRoutes)
    app.use("/product", ProductRoutes);
    app.use("/upload/image", UploadImageRoutes);
    app.use("/order", OrderRoutes);
    app.use("/cart", CartRoutes)
    app.use("/category", CategoryRoutes);
    app.use("/search/", SearchRoutes);
    // app.use("/traceflow", traceflowRoutes)
    // app.use("./authorization/routes/forgotPasswordRoutes", forgotPasswordRoutes); (NOT SURE YET)

    app.listen(PORT, ADDRESS, () => {
      console.log("Server Listening on PORT:", port);
    });
  })
  .catch((err) => {
    console.error("Sequelize Initialization threw an error:", err);
  }
);

const express = require("express");
const app = express();
const cors = require("cors"); // For Cross Origin Resource Sharing
// const Sequelize = require("sequelize"); // For ORM
const morgan = require("morgan"); // For logging
require('dotenv').config();

const sequelize= require("./common/models/SequelizeInstance");

const { port } = require("./config");
const PORT = port || 3001;

// Route Imports
const AuthorizationRoutes = require("./authorization/routes");
const UserRoutes = require("./users/routes");
const AddressRoutes = require("./address/routes");
const ProductRoutes = require("./products/routes");
const UploadImageRoutes = require("./common/images/UploadImage");
const OrderRoutes = require("./order/routes");
const CartRoutes = require("./cart/routes");
const { Cart } = require("./common/models/Cart");
// const traceflowRoutes = require("./traceflowRouters/routes");

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
    // app.use("/traceflow", traceflowRoutes)

    app.listen(PORT, '127.0.0.1', () => {
      console.log("Server Listening on PORT:", port);
    });
  })
  .catch((err) => {
    console.error("Sequelize Initialization threw an error:", err);
  }
);

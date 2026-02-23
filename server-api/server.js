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
const SearchRoutes = require("./common/meilisearch/routes")
const AssetRoutes = require("./asset/routes")
// const traceflowRoutes = require("./traceflowRouters/routes");

app.use(morgan("tiny"));
app.use(cors());
// const traceflowRoutes = require("./traceflowRouters/routes");

const { Payment } = require('./common/models/Payment');


app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static('uploads'));

app.use(morgan("tiny"));
app.use(cors());

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
    app.use("/search", SearchRoutes);
    app.use("/asset", AssetRoutes);
    // app.use("/traceflow", traceflowRoutes)

    app.listen(PORT, ADDRESS, async () => {
      console.log("Server Listening on PORT:", port);
      
      // Auto-seed categories if empty (NEW)
      setTimeout(async () => {
        try {
          const { Category } = require("./common/models/Category");
          const count = await Category.count();
          
          if (count === 0) {
            console.log('🌱 Database empty, auto-seeding categories...');
            const { seedCategories } = require('./Categories/controllers/CategoriesController');
            await seedCategories({}, { 
              status: () => ({ json: (data) => console.log('✅ Auto-seed:', data.message) }) 
            });
          } else {
            console.log(`✅ ${count} categories already in database`);
          }
        } catch (err) {
          console.error('Auto-seed error:', err.message);
        }
      }, 1000);
    });
  })
  .catch((err) => {
    console.error("Sequelize Initialization threw an error:", err);
  }
);

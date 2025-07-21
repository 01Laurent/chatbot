const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const sequelize = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

const PORT = 5000;

sequelize.sync()
  .then(() => {
    console.log("✅ Connected to MySQL and synced models");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MySQL connection error:", err));

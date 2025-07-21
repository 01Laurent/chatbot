const express = require("express");
const { handleChat } = require("../controllers/chatController");
const router = express.Router();

router.post("/message", handleChat);

module.exports = router;
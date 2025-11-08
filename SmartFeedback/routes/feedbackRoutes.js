const express = require("express");
const router = express.Router();
const feedback = require("../controllers/feedbackController");

router.get("/feedback", feedback.getFeedback);
router.post("/feedback", feedback.postFeedback);
router.get("/history", feedback.getHistory);

module.exports = router;

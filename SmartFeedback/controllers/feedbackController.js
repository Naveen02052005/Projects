const { v4: uuidv4 } = require("uuid");
const connection = require("../db/connection");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

exports.getFeedback = (req, res) => {
  res.render("feedback.ejs");
};

exports.postFeedback = (req, res) => {
  const { message, typeofCategory, categoryName } = req.body;
  const result = sentiment.analyze(message);
  const sentimentLabel = result.score > 0 ? "Positive" : result.score < 0 ? "Negative" : "Neutral";
  const feedbackId = uuidv4();
  const userId = req.session.userId || null;

  const q1 = "INSERT INTO feedback(feedbackId,userId,message,sentiment) VALUES (?,?,?,?)";
  connection.query(q1, [feedbackId, userId, message, sentimentLabel], (err) => {
    if (err) throw err;

    const q2 = "INSERT INTO servicetype(feedbackId,typeofCategory,categoryName) VALUES(?,?,?)";
    connection.query(q2, [feedbackId, typeofCategory, categoryName], (err2) => {
      if (err2) throw err2;
      res.render("success.ejs", { sentimentLabel, typeofCategory, categoryName, userId });
    });
  });
};

exports.getHistory = (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const q = `
    SELECT f.message, f.sentiment, f.timestamp, s.typeofCategory, s.categoryName, u.userName
    FROM feedback f
    LEFT JOIN serviceType s ON f.feedbackId = s.feedbackId
    JOIN UserDetails u ON f.userId = u.id
    WHERE f.userId = ? ORDER BY f.timestamp DESC
  `;
  connection.query(q, [req.session.userId], (err, results) => {
    if (err) throw err;
    res.render("history.ejs", { results });
  });
};

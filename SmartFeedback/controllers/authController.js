const connection = require("../db/connection");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// ---------------- REGISTER ----------------
exports.getRegister = (req, res) => {
  res.render("registration.ejs", { nameError: null, emailError: null });
};

exports.postRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.render("registration.ejs", {
        nameError: "Please fill all fields properly.",
        emailError: null,
      });
    }

    const checkUserQuery = "SELECT * FROM UserDetails WHERE userName = ?";
    connection.query(checkUserQuery, [userName], (err, userResults) => {
      if (err) throw err;

      if (userResults.length > 0) {
        return res.render("registration.ejs", {
          nameError: "Username already exists. Try another one.",
          emailError: null,
        });
      }

      const checkEmailQuery = "SELECT * FROM UserDetails WHERE email = ?";
      connection.query(checkEmailQuery, [email], async (err2, emailResults) => {
        if (err2) throw err2;

        if (emailResults.length > 0) {
          return res.render("registration.ejs", {
            nameError: null,
            emailError: "Email already exists. Try another one.",
          });
        }

        // ✅ Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();

        const insertQuery =
          "INSERT INTO UserDetails (id, userName, email, password) VALUES (?, ?, ?, ?)";
        connection.query(
          insertQuery,
          [id, userName, email, hashedPassword],
          (err3) => {
            if (err3) throw err3;
            console.log("Registered successfully");
            res.redirect("/login");
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

// ---------------- LOGIN ----------------
exports.getLogin = (req, res) => {
  res.render("login.ejs", { error: null });
};

exports.postLogin = (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide userName and password" });
  }

  const q = "SELECT * FROM UserDetails WHERE userName = ? OR email = ?";
  connection.query(q, [userName, userName], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.render("login.ejs", { error: "User not found" });
    }

    const user = results[0];

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login.ejs", { error: "Invalid password" });
    }

    // ✅ Login success
    req.session.userId = user.id;
    console.log("Login successful");
    res.redirect("/feedback");
  });
};

// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/login");
  });
};

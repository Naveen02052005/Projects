const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");


const mysql=require("mysql2");

const {v4:uuidv4} = require("uuid");

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const session = require("express-session");
const { timeStamp } = require("console");
const { connect } = require("http2");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});




app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true
}));


const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'SmartFeedback',
    password:'N@veen2033y'
});


app.get("/registration", (req, res) => {
  res.locals.nameError = null;
  res.locals.emailError = null
  res.render("registration.ejs", { nameError: null, emailError: null });
});


app.post("/register", (req, res) => {
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
    connection.query(checkEmailQuery, [email], (err2, emailResults) => {
      if (err2) throw err2;

      if (emailResults.length > 0) {
        return res.render("registration.ejs", {
          nameError: null,
          emailError: "Email already exists. Try another one.",
        });
      }

      const id = uuidv4();
      const insertQuery =
        "INSERT INTO UserDetails (id, userName, email, password) VALUES (?, ?, ?, ?)";
      connection.query(insertQuery, [id, userName, email, password], (err3) => {
        if (err3) throw err3;

        console.log("Registered successfully");
        res.redirect("/login");
      });
    });
  });
});


app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null }); // initially no error
});

app.post("/login",(req,res)=>{
    const {userName, password}=req.body;

    if(!userName || !password)
    {
        return res.status(400).json({
            success:false,
            message:"Please provide userName and password"
        })
    }

    const q = "SELECT * FROM UserDetails WHERE (userName = ?  OR email = ?) AND password= ?"
    connection.query(q,[userName,userName,password],(err,results)=>{
        if(err) throw err;
        
        if(results.length == 0)
        {
            
            return res.render("login.ejs",{error:"Username or password is not available"});
        }
        req.session.userId = results[0].id
        res.redirect("/feedback");
    })
})

app.get("/feedback",(req,res)=>{
    res.render("feedback.ejs");
})

app.post("/feedback",(req,res)=>{

    let {message,typeofCategory,categoryName} = req.body;
    

    const result =  sentiment.analyze(message);
    const sentimentLabel = result.score > 0 ?"Positive" : result.score < 0 ? "Negative" : "Neutral";
    
    console.log(sentimentLabel);

    let feedbackId=uuidv4();
    let userId = req.session.userId || null;
    let i=0;
    const q1 = `INSERT INTO feedback(feedbackid,userId,message,sentiment) VALUES (?,?,?,?) `
    
    connection.query(q1,[feedbackId,userId,message,sentimentLabel],(err,results)=>{
        if(err) throw err;
       

         const q2 = `INSERT INTO servicetype(feedbackId,typeofCategory,categoryName) VALUES(?,?,?)`;
    
         connection.query(q2,[feedbackId,typeofCategory,categoryName],(err2,result2)=>{
             if(err) throw err;
        });
        
         res.render("success.ejs",{sentimentLabel,typeofCategory,categoryName,userId});

   });

})


app.get("/visualize", (req, res) => {
  const q1 = "SELECT sentiment, COUNT(*) AS count FROM Feedback GROUP BY sentiment";
  const q2 = "SELECT s.categoryName, f.sentiment,COUNT(*) AS count FROM feedback f JOIN servicetype s ON f.feedbackId = s.feedbackId GROUP BY s.categoryname, f.sentiment";

  connection.query(q1, (err, results) => {
    if (err) throw err;


    const labels = results.map(r => r.sentiment);
    const counts = results.map(r => r.count);
    connection.query(q2,(err,result)=>{
        if(err) throw err;
        const categories = [...new Set(result.map(r => r.categoryName))];
        const sentiments = ['Positive', 'Negative', 'Neutral'];

        const chartData = sentiments.map(sent => {
            return {
                label : sent,
                data : categories.map(cat => {
                    const item = result.find(r => r.categoryName === cat && r.sentiment === sent);
                    return item ? item.count : 0;
                })
            }
        })
   
    res.render("visualize.ejs", { labels, counts, categories, chartData });
     });
   });
});

app.get("/history",(req,res)=>{
    if(!req.session.userId)
    {
        return res.redirect("/login");
    }
    const q1 = `SELECT f.message, f.sentiment, f.timestamp,s.typeofCategory,s.categoryName, u.userName
    From feedback f LEFT JOIN serviceType s ON f.feedbackId = s.feedbackId 
    JOIN UserDetails u ON f.userId = u.id
    WHERE f.userId =? ORDER BY f.timestamp DESC`;

    connection.query(q1,[req.session.userId],(err,results)=>{
        if(err) throw err;

                res.render("history.ejs",{results});
            })
        })
        

app.get("/admin/user",(err,res)=>{
    
    let userQuery = `SELECT * FROM UserDetails`;
    let feedbackQuery = `SELECT * FROM feedback`;
    let categoryTable = `SELECT * FROM serviceType`;

    try{
        connection.query(userQuery,(err,users)=>{
            if(err) throw err;

            connection.query(feedbackQuery,(err,results)=>{
                if(err) throw err;

                connection.query(categoryTable,(err,services)=>{
                if(err) throw err;

            
                res.render("user",{users,results,services})

            });
                

         })
            
            
    })
}
    catch(err)
    {
        console.log(err);
        res.send("Some error in DB");
    }

})




app.get("/adminLogin",(req,res)=>{
    res.render("adminLogin.ejs",{error:null})
})

app.post("/adminLogin",(req,res)=>{
    let {adminName,password} = req.body || {};

    if(!adminName || !password)
    {
        return res.status(400).json({
            success: false,
            message:"Please provide both adminName and password"
        })
    }

    let q = `SELECT * FROM admin WHERE (adminName = ? OR email = ?) AND password = ?`;

    connection.query(q,[adminName,adminName,password],(err,results)=>{
        if(err) throw err;

        if(results.length == 0)
        {
            return res.render("adminLogin.ejs",{error:"AdminName or password is not available"});
           
        }
        req.session.adminId = results[0].id;
        console.log(req.body);
        res.redirect("/admin");
    })
})




app.get("/admin",(req,res)=>{
    const q1 ='SELECT sentiment, COUNT(*) AS  count FROM Feedback GROUP BY sentiment';
    
    const q2 = "SELECT sentiment, COUNT(*) AS count FROM Feedback GROUP BY sentiment";

    const q3 = "SELECT s.categoryName, f.sentiment,COUNT(*) AS count FROM feedback f JOIN servicetype s ON f.feedbackId = s.feedbackId GROUP BY s.categoryname, f.sentiment";
    connection.query(q1,(err,result)=>{
        if(err) throw err;

        

         connection.query(q2, (err, results) => {
            if (err) throw err;

            connection.query(q3,(err,barChart)=>{
                if(err) throw err;

                const categories = [...new Set(barChart.map(r => r.categoryName))];
                const sentiments = ['Positive', 'Negative', 'Neutral'];

                const chartData = sentiments.map(sent => {
                    return {
                        label : sent,
                        data : categories.map(cat => {
                            const item = barChart.find(r => r.categoryName === cat && r.sentiment === sent);
                            return item ? item.count : 0;
                        })
                    }
                })
            
   
            const labels = results.map(r => r.sentiment);
            const counts = results.map(r => r.count);

        let data = {Positive:0, Negative:0, Neutral:0};
        result.forEach(r =>data[r.sentiment] = r.count);
        res.render("admin.ejs",{data,labels,counts,categories, chartData });
       })
    })
  })
})


app.get("/admin/feedbackData",(req,res)=>{
    const q = `SELECT * FROM Feedback`;

    connection.query(q,(err,results)=>{
        if(err) throw err;

        res.render("feedbackDatas",{results});
    })
})



app.delete("/admin/feedbackData/:feedbackId",(req,res)=>{
    let {feedbackId} = req.params;

    let q = `SELECT * FROM Feedback WHERE feedbackId = ?`;

    connection.query(q,[feedbackId],(err)=>{
        if(err) throw err;

        let q1 = `DELETE FROM SERVICETYPE WHERE feedbackId = '${feedbackId}'`;
        let q2 = `DELETE FROM Feedback WHERE feedbackId = '${feedbackId}'`;
        connection.query(q1,(err)=>{
            if(err) throw err;
            
            connection.query(q2,(err)=>{
                if(err) throw err;
                else{
                    console.log("deleted");
                    res.json({ success: true });
            }
            })
        })
    })
})


app.get("/admin/user/:id/edit",(req,res)=>{
    let {id} = req.params;

    let q = `SELECT * FROM UserDetails WHERE id =?`;

    connection.query(q,[id],(err,result)=>{
        if(err) throw err;

        let user = result[0];
        
        res.render("edit",{user});
    })
})

app.patch("/admin/user/:id", (req, res) => {
  const { id } = req.params;
  const { userName, email } = req.body;

  if (!userName || !email) {
    return res.render("edit", {
      user: { id, userName, email },
      error: "Both username and email are required.",
    });
  }

  const checkQuery = `
    SELECT * FROM UserDetails
    WHERE (userName = ? OR email = ?) AND id != ?
  `;

  connection.query(checkQuery, [userName, email, id], (err, results) => {
    if (err) {
      console.error("Error checking duplicates:", err);
      return res.status(500).send("Database error during duplicate check.");
    }

    if (results.length > 0) {
      return res.render("edit", {
        user: { id, userName, email },
        error: "Username or email already exists. Try different values.",
      });
    }

    const updateQuery = `
      UPDATE UserDetails
      SET userName = ?, email = ?
      WHERE id = ?
    `;

    connection.query(updateQuery, [userName, email, id], (err2) => {
      if (err2) {
        console.error("Error updating user:", err2);
        return res.status(500).send("Database error during update.");
      }

      console.log("User updated successfully");
      res.redirect("/admin/user");
    });
  });
});


app.delete("/admin/user/:id",(req,res)=>{
    let {id} = req.params;

    let q1 = `SELECT feedbackId FROM Feedback WHERE userId = ?`;

    connection.query(q1,[id],(err,feedbacks)=> {
        if(err) throw err;

        if(feedbacks.length == 0){
            const deluser ="DELETE FROM UserDetails WHERE id = ?";
            connection.query(deluser,[id],(err2)=>{
                if(err2) throw err2;
                return res.json({success: true});
            });
        }
        else{
            const feedbackIDs = feedbacks.map((f) => f.feedbackId);
            const delService = "DELETE FROM ServiceType WHERE feedbackId IN (?)";

            connection.query(delService,[feedbackIDs],(err3)=>{
                if(err3) throw err3;

                const delFeedback = "DELETE FROM Feedback WHERE userId = ?";
                connection.query(delFeedback,[id],(err4)=>{
                    if(err4) throw err4;

                    const delUser = 'DELETE FROM UserDetails WHERE id = ?';
                    connection.query(delUser,[id],(err5)=>{
                        if(err5) throw err5;

                        return res.json({success:true})
                    })
                })
            })
        }

    })
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
        }
        res.redirect("/login");
    });
});


app.listen(8080,()=>{
    console.log("Listening to port 8080");
})


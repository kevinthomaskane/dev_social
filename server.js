const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const emoji = require("node-emoji");
const path = require("path")

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

//connect to mongodb
mongoose
  .connect(db)
  .then(() => console.log("mongo connected"))
  .catch(error => console.log(error));

// passport middleware
app.use(passport.initialize());

// passport config
require("./config/passport")(passport);

// use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

//server static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

const port = process.env.PORT || 5000;

if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI)
} else {
  mongoose.connect(db)
}

// emojis come from json file here https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
const earth = emoji.get("earth_americas");

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});


app.listen(port, () => {
  console.log(`${earth} server running on port ${port}!`);
});

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const signupRoutes = require("./routes/signup");
const loginRoutes = require("./routes/login");
const indexRoutes = require("./routes/index");
const sequelize = require("./utils/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

app.use(loginRoutes);
app.use(signupRoutes);
app.use("/", indexRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server run on port", PORT);
    });
  })
  .catch((err) => console.log(err));

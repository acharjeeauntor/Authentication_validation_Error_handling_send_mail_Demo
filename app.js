const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const signupRoutes = require("./routes/signup");
const loginRoutes = require("./routes/login");
const indexRoutes = require("./routes/index");
const sequelize = require("./utils/database");
const flash = require("connect-flash");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(loginRoutes);
app.use(signupRoutes);
app.use("/", indexRoutes);
const PORT = process.env.PORT || 3000;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server run on port", PORT);
    });
  })
  .catch((err) => console.log(err));

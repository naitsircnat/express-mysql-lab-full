/*
installations - wax-on, express, handlebars-helpers, hbs, dotenv, 
folders
require
handlebars-helpers
test route
app.listen
*/

const express = require("express");
const { handle } = require("express/lib/application");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

let app = express();

app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

const helpers = require("handlebars-helpers");
helpers({
  handlebars: hbs.handlebars,
});

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.listen(3000, () => {
  console.log("Server started");
});

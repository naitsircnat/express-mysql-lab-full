/*
installations - wax-on, express, handlebars-helpers, hbs, dotenv, 
folders
require
handlebars-helpers
test route
app.listen
*/

const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const { createConnection } = require("mysql2/promise");

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

let connection;

async function main() {
  connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });

  app.get("/", (req, res) => {
    res.send("Hello, World");
  });

  // Show customers
  app.get("/customers", async (req, res) => {
    let [customers] = await connection.execute({
      sql: `
      SELECT * FROM Customers JOIN Companies ON Customers.company_id=Companies.company_id`,
      nestTables: true,
    });

    console.log(customers);

    res.render("customers/index", {
      customers: customers,
    });
  });

  // Create customer
  /*
  Get companies
  - create app.get with appropriate URL
  - create customers/create page with relevant fields   
  */

  app.get("/customers/create", async (req, res) => {
    let [companies] = await connection.execute("SELECT * FROM Companies");

    res.render("customers/create", {
      companies: companies,
    });
  });
}

main();

app.listen(3000, () => {
  console.log("Server started");
});

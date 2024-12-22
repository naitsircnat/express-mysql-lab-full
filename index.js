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

  app.get("/customers/create", async (req, res) => {
    let [companies] = await connection.execute("SELECT * FROM Companies");

    res.render("customers/create", {
      companies: companies,
    });
  });

  app.post("/customers/create", async (req, res) => {
    const { first_name, last_name, rating, company_id } = req.body;

    let query =
      "INSERT INTO Customers (first_name, last_name, rating, company_id) VALUES (?, ?, ?, ?)";

    let bindings = [first_name, last_name, rating, company_id];

    let results = await connection.execute(query, bindings);
    res.redirect("/customers");
  });

  // update customer
  /*
  - create app.get to create form, with relevant URL
  - assign customer ID as variable using req.params
  - get customer from database
  - get list of companies
  - pass companies and customer to handlebars
  */

  app.get("/customers/:customerId/edit", async (req, res) => {
    const [customers] = await connection.execute(
      "SELECT * FROM Customers WHERE customer_id=?",
      [req.params.customerId]
    );

    const customer = customers[0];

    const [companies] = await connection.execute("SELECT * FROM Companies");

    res.render("customers/edit", {
      customer: customer,
      companies: companies,
    });
  });
}

main();

app.listen(3000, () => {
  console.log("Server started");
});

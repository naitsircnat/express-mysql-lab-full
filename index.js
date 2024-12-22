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

    let [employees] = await connection.execute("SELECT * FROM Employees");

    res.render("customers/create", {
      companies: companies,
      employees: employees,
    });
  });

  app.post("/customers/create", async (req, res) => {
    const { first_name, last_name, rating, company_id, employee_id } = req.body;

    let query =
      "INSERT INTO Customers (first_name, last_name, rating, company_id) VALUES (?, ?, ?, ?)";

    let bindings = [first_name, last_name, rating, company_id];

    let [result] = await connection.execute(query, bindings);

    let insertedEmployeeId = result.insertId;

    for (let id of employee_id) {
      await connection.execute(
        "INSERT INTO EmployeeCustomer (employee_id, customer_id) VALUES (?,?)",
        [id, insertedEmployeeId]
      );
    }

    res.redirect("/customers");
  });

  // update customer
  app.get("/customers/:customerId/edit", async (req, res) => {
    const [customers] = await connection.execute(
      "SELECT * FROM Customers WHERE customer_id=?",
      [req.params.customerId]
    );

    const customer = customers[0];

    const [companies] = await connection.execute("SELECT * FROM Companies");

    const [employees] = await connection.execute("SELECT * FROM Employees");

    const [customerEmployeeRows] = await connection.execute(
      "SELECT * FROM EmployeeCustomer WHERE customer_id=?",
      [req.params.customerId]
    );

    const relatedEmployees = customerEmployeeRows.map((ec) => ec.employee_id);

    res.render("customers/edit", {
      customer: customer,
      companies: companies,
      employees: employees,
      relatedEmployees: relatedEmployees,
    });
  });

  app.post("/customers/:customerId/edit", async (req, res) => {
    const { first_name, last_name, rating, company_id } = req.body;

    await connection.execute(
      "UPDATE Customers SET first_name=?, last_name=?, rating=?, company_id=? WHERE customer_id=?",
      [first_name, last_name, rating, company_id, req.params.customerId]
    );

    res.redirect("/customers");
  });
}

main();

app.listen(3000, () => {
  console.log("Server started");
});

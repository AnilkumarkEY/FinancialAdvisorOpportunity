require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");

// const caCert = fs.readFileSync(process.env.DB_CACERT).toString();
// Connect to the PostgreSQL server using environment variables
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    // ca: caCert,
    rejectUnauthorized: false,
  },
});

async function connectToDatabase() {
  try {
    // Connect to the PostgreSQL database
    await client.connect();
    console.log("Connected to the database successfully!");

    // You can execute queries here
    const res = await client.query("SELECT NOW()");
    console.log("Current Time: ", res.rows[0]);
  } catch (err) {
    console.error("Connection error", err.stack);
  }
}

// Run the function to connect to the database
module.exports = {
  client,
  connectToDatabase,
};

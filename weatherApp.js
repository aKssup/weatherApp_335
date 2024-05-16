const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

process.stdin.setEncoding("utf8");
const prompt = "Stop to shutdown the server: ";
app.listen(process.env.PORT_NUMBER);
console.log("Web server started and running at http://localhost:" + process.env.PORT_NUMBER);

process.stdout.write(prompt);
process.stdin.on("readable", function() {
    const input = process.stdin.read();
    if (input != null) {
        const command = input.trim();
        if (command == "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs")

app.get("/", (request, response) => {
    response.render("home");
});

// const fetch = require('node-fetch'); // Ensure you have node-fetch installed: npm install node-fetch

// const getWeatherByZipCode = async (zipCode, apiKey) => {
//   const apiURL = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${apiKey}`;

//   try {
//     const response = await fetch(apiURL);
//     const weatherData = await response.json();

//     if (response.ok) {
//       console.log(`Weather in ${weatherData.name}:`);
//       console.log(`Temperature: ${weatherData.main.temp}K`);
//       console.log(`Weather: ${weatherData.weather[0].description}`);
//     } else {
//       console.error(`Error: ${weatherData.message}`);
//     }
//   } catch (error) {
//     console.error('Fetch error: ', error);
//   }
// };

// // Replace 'your_zip_code' and 'your_api_key' with actual values
// const zipCode = 'your_zip_code';
// const apiKey = 'your_api_key';

// getWeatherByZipCode(zipCode, apiKey);
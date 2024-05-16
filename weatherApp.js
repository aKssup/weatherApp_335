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

app.use(bodyParser.urlencoded({extended:false}));
app.post("/weather", (request, response) => {
    // API
    async function apiCall() {
        const apiURL = `https://api.openweathermap.org/data/2.5/weather?zip=${request.body.zipcode},us&appid=${process.env.API_KEY}`
        try {
            const res = await fetch(apiURL);
            const data = await res.json();
            const temp = ((data.main.temp - 273.15) * 9/5 + 32);
            const tempFeel = ((data.main.feels_like - 273.15) * 9/5 + 32);
            const ansString = `
                Weather in ${data.name}:
                - Temperature: ${temp.toFixed(2)}°F (Feels like: ${tempFeel.toFixed(2)}°F)
                - Weather: ${data.weather[0].main} (${data.weather[0].description})
                - Humidity: ${data.main.humidity}%
                - Wind: ${data.wind.speed} m/s at ${data.wind.deg}°
                - Visibility: ${data.visibility} meters
                - Cloudiness: ${data.clouds.all}%
                ${data.rain ? `- Rain volume (last hour): ${data.rain['1h']} mm` : ''}
                ${data.snow ? `- Snow volume (last hour): ${data.snow['1h']} mm` : ''}`;

            const variables = {
                weather: ansString
            }
            response.render("weather", variables);
            main(ansString).catch(console.error);
        } catch (error) {
            response.render("weather", {weather: "INVALID ZIP CODE. Check console log for why."})
            console.log("Fetch Error: ", error);
        }
    }
    apiCall().catch(console.error);
    // MongoDB
    async function main(ansString) {
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();
            let newUser = {
                email: request.body.email,
                zip: request.body.zipcode,
                requestBody: ansString
            };
            await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newUser);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
});
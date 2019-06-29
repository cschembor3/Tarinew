const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function (req, res) {
    let characterName = req.body.characterName;
    let characterRace = req.body.characterRace;
    let characterClass = req.body.characterClass;
    let characterLevel = req.body.characterLevel;
    res.send("Character name: " + characterName + "\n" +
             "Character race: " + characterRace + "\n" +
             "Character class: " + characterClass + "\n" +
             "Character level: " + characterLevel + "\n");
});

http.createServer(app).listen(12345);
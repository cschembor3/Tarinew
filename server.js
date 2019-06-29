const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', async function (req, res) {
    let characterName = req.body.characterName;
    let characterRace = req.body.characterRace;
    let characterClass = req.body.characterClass;
    let characterLevel = req.body.characterLevel;
    try {
      const client = await pool.connect()
      const dbReq = await client.query('INSERT INTO character_info_table (id, name, race, class, level',
        [2, characterName, characterRace, characterClass, characterLevel], (error, response) => {
          if (error) {
            throw error;
          }
          response.status(201).send('User created!');
        });
      const result = await client.query('SELECT * FROM character_info_table');
      const results = { 'results': (result) ? result.rows : null};
      res.json({
        response: results
      });
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});

http.createServer(app).listen(port);
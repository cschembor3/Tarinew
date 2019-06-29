const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const port = process.env.port || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', async function (req, res) {
    let characterName = req.body.characterName;
    let characterRace = req.body.characterRace;
    let characterClass = req.body.characterClass;
    let characterLevel = req.body.characterLevel;
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM character_info_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});

http.createServer(app).listen(port);
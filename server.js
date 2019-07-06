const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const port = process.env.PORT || 12345;

app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*
 * Inserts the character information into the database
 */
app.post('/', async function (req, res, next) {
  let characterName = req.body.characterName;
  let characterRace = req.body.characterRace;
  let characterClass = req.body.characterClass;
  let characterLevel = req.body.characterLevel;
  try {
    const client = await pool.connect();
    const dbReq = await client.query('INSERT INTO character_info_table (id, name, race, class, level) VALUES ($1, $2, $3, $4, $5)',
      [2, characterName, characterRace, characterClass, characterLevel], (error, response) => {
        if (error) {
          throw error;
        }
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

/*
 * Gets the character information for the given id
 */
app.get('/players/:playerId', function(req, res, next) {
  const client = await pool.connect();
  const playerId = req.params.playerId;
  let characterData = {};
  try {
    await client.query(
      'SELECT name, level ' +
      'FROM character_info_table ' +
      'WHERE name = $1',
      [playerId], (error, response) => {
        characterData.player = response
          ? response.rows[0]
          : null;
      });
      
    await client.query('SELECT spellName, description, spellLevel ' +
      'FROM spells ' +
      'WHERE name = $1',
      [playerId], (error, response) => {
        characterData.spells = response
          ? response.rows
          : null;
      });

    res.json({
      'result': characterData
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

http.createServer(app).listen(port);
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
app.get('/players/:playerId', async function(req, res, next) {
  const client = await pool.connect();
  const playerId = req.params.playerId;
  await client.query(
    'SELECT character_info_table.name, character_info_table.level, spells.name, spells.description' +
    'FROM character_info_table, spells' +
    'WHERE character_info_table.name = $1 AND spells.charactername = $1',
    [playerId],
    (error, response) => {
      if (error) {
        console.log(error);
        res.send('Error: ' + error);
      }

      res.json({
        'response': response
        ? response.rows[0]
        : null
      });
    });
});

http.createServer(app).listen(port);
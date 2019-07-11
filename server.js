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

app.use(bodyParser.json());
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
    await pool.query('INSERT INTO character_info_table (id, name, race, class, level) VALUES ($1, $2, $3, $4, $5)',
      [2, characterName, characterRace, characterClass, characterLevel],
      (error, response) => {
        if (error) {
          throw error;
        }
      });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

/*
 * Add an item to a given player
 */
app.post('/players/:playerId/items', async function(req, res, next) {
  const playerId = req.params.playerId;
  const itemName = req.body.itemName;
  const itemDescription = req.body.itemDescription;
  try {
    await pool.query(
      'INSERT INTO items ' +
      '(itemname, itemdescription, charactername) VALUES ($1, $2, $3)',
      [itemName, itemDescription, playerId],
      (error, response) => {
        if (error) {
          res.send('Error: ' + error);
        }

        res.status(201).end();
      });
  } catch (err) {
    res.send('Error ' + err);
  }
});

/*
 * Add a spell to a given player
 */
app.post('/players/:playerId/spells', async function(req, res, next) {
  const playerId = req.params.playerId;
  const spellName = req.body.spellName;
  const spellDescription = req.body.spellDescription;
  const spellLevel = req.body.spellLevel;
  try {
    await pool.query(
      'INSERT INTO spells ' +
      '(spellname, description, spelllevel, charactername) VALUES ($1, $2, $3, $4)',
      [spellName, spellDescription, spellLevel, playerId],
      (error, response) => {
        if (error) {
          res.send('Error: ' + error);
        }

        res.status(201).end();
      });
  } catch (err) {
    res.send('Error ' + err);
  }
});

/*
 * Gets the character information for the given id
 */
app.get('/players/:playerId', async function(req, res, next) {
  const client = await pool.connect();
  const playerId = req.params.playerId;
  let characterData = {};
  try {
    await pool.query(
      'SELECT * ' +
      'FROM character_info_table, items, spells ' +
      'WHERE character_info_table.name = $1 AND items.charactername = $1 AND spells.charactername = $1',
      [playerId], (error, response) => {
        if (error) {
          reject();
          res.send(error);
        }

        res.json(response);
        characterData = response;
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
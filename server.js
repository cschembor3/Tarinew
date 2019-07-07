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
  const client = await pool.connect();
  const playerId = req.params.playerId;
  const itemName = JSON.parse(req.body).itemName;
  const itemDescription = JSON.parse(req.body).itemDescription;
  try {
    await client.query(
      'INSERT INTO items ' +
      '(itemname, itemdescription, charactername) VALUES ($1, $2, $3);' +
      [itemName, itemDescription, playerId],
      (error, response) => {
        if (error) {
          res.send('Error: ' + error
                    + 'itemname: ' + itemName
                    + 'itemdescription: ' + itemDescription);
        }

        res.status(201).end();
      });

    client.release();
  } catch (err) {
    res.send('Error ' + err);
  }
});

/*
 * Add a spell to a given player
 */
app.post('/players/:playerId/spells', async function(req, res, next) {
  const client = await pool.connect();
  const playerId = req.params.playerId;
  const spellName = req.body.spellname;
  const spellDescription = req.body.description;
  const spellLevel = req.body.spelllevel;
  try {
    await client.query(
      'INSERT INTO spells ' +
      '(spellname, description, spelllevel, charactername) VALUES ($1, $2, $3, $4)' +
      [spellName, spellDescription, spellLevel, playerId],
      (error, response) => {
        if (error) {
          throw error;
        }
      });

      client.release();
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
    const playerPromise =  new Promise(function(resolve, reject) {
      client.query(
        'SELECT name, level ' +
        'FROM character_info_table ' +
        'WHERE name = $1',
        [playerId], (error, response) => {
          if (error) {
            reject();
            res.send(error);
          }
  
          characterData.player = response
            ? response.rows[0]
            : null;
          
          resolve();
        });
    });

    const spellsPromise = new Promise(function(resolve, reject) {
        client.query(
        'SELECT spellname, description, spelllevel ' +
        'FROM spells ' +
        'WHERE charactername = $1',
        [playerId], (error, response) => {
          if (error) {
            reject();
            res.send(error);
          }
  
          characterData.spells = response
            ? response.rows
            : null;

          resolve();
        });
    });

    Promise.all([spellsPromise]).then(() => {
      res.json({
        'result': characterData
      });
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

http.createServer(app).listen(port);
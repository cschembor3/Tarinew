const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});

const port = process.env.PORT;

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
      '(spellname, spelldescription, spelllevel, charactername) VALUES ($1, $2, $3, $4)',
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
 * Add/update a character's description
 */
app.post('/players/:playerId/description', async function(req, res, next) {
  const playerId = req.params.playerId;
  const description = req.body.characterDescription;
  try {
    await pool.query(
      'UPDATE character_info_table ' +
      'SET description = ($1) ' +
      'WHERE name = ($2)',
      [description, playerId],
      (error, response) => {
        if (error) {
          throw error;
        }

        res.status(201).end();
      });
  }
  catch (err) {
    res.send('Error: ' + err);
  }
});

/*
 * Update player stats
 */
app.post('/players/:playerId/stats', async function(req, res, next) {
  const playerId = req.params.playerId;
  const strength = req.body.strength;
  const dexterity = req.body.dexterity;
  const constitution = req.body.constitution;
  const intelligence = req.body.intelligence;
  const wisdom = req.body.wisdom;
  const charisma = req.body.charisma;

  try {
    await pool.query(
      'UPDATE character_info_table ' +
      'SET strength = ($1), ' + 
      'dexterity = ($2), ' +
      'constitution = ($3), ' +
      'intelligence = ($4), ' +
      'wisdom = ($5), ' +
      'charisma = ($6) ' +
      'WHERE name = ($7)',
      [
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        playerId
      ], (error, response) => {
        if (error) {
          res.send(error);
        }

        res.status(200).end();
      }
    );
  }
  catch (err) {
    res.send('Error: ' + err);
  }
});


/*
 * Gets the character information for the given id
 */
app.get('/players/:playerId', async function(req, res, next) {
  const playerId = req.params.playerId;
  let characterData = {};
  try {
    const spellsQueryPromise = new Promise(function(resolve, reject) {
      pool.query(
        'SELECT * ' +
        'FROM character_info_table ' +
        'FULL OUTER JOIN spells ' +
        'ON spells.charactername = character_info_table.name ' +
        'WHERE character_info_table.name = $1',
        [playerId], (error, response) => {
          if (error) {
            reject();
            res.send(error);
          }

          const data = response.rows;
          characterData.characterInfo = {
            name: data[0].name,
            race: data[0].race,
            class: data[0].class,
            level: data[0].level,
            description: data[0].description,
            stats: {
              strength: data[0].strength,
              dexterity: data[0].dexterity,
              constitution: data[0].constitution,
              intelligence: data[0].intelligence,
              wisdom: data[0].wisdom,
              charisma: data[0].charisma
            }
          };

          characterData.spells = [];
          data.forEach(row => {
            if (row.spellname != null && row.spelldescription != null && row.spelllevel != null) {
              characterData.spells.push({
              spellName: row.spellname,
              spellDescription: row.spelldescription,
              spellLevel: row.spelllevel
              });
            }
          });

          resolve();
        });
    });

    const itemsQueryPromise = new Promise(function(resolve, reject) {
      pool.query(
        'SELECT * ' +
        'FROM items ' +
        'WHERE items.charactername = $1',
        [playerId], (error, response) => {
          if (error) {
            reject();

            res.send(error);
          }
          const data = response.rows;
          characterData.items = [];
          data.forEach(row => {
            characterData.items.push({
              itemName: row.itemname,
              itemDescription: row.itemdescription
            });
          });

          resolve();
        }
      );
    });

    Promise.all([spellsQueryPromise, itemsQueryPromise]).then(function() {
      res.json(characterData);
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

http.createServer(app).listen(port);

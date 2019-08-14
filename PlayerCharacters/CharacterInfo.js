const playersEndpoint = 'https://boiling-sea-30343.herokuapp.com/players/';
const localEndpoint = 'http://localhost:12345/players/'
const dndBeyondSpells = 'https://www.dndbeyond.com/spells/';

/*
 * Get the character info, and populate the tables
 */
function getCharacterInfo(characterName) {
    $('.spinner').show();
    $('.page.greyout').fadeIn();
    $.get(
        localEndpoint + characterName,
        function(data) {
            data = JSON.stringify(data);
            const playerObj = JSON.parse(data);
            document.getElementById('level').append(playerObj.characterInfo.level);
            $('#description').html(playerObj.characterInfo.description);
            populateCharacterStats(playerObj.characterInfo.stats);
            $('#description').val(playerObj.characterInfo.description);
            const dndBeyondSpells = 'https://www.dndbeyond.com/spells/';
            const spells = playerObj.spells;
            const spellTable = document.getElementById('spellsTable');
            $('spellTable').empty();
            spells.forEach(spell => {
                const row = spellTable.insertRow();
                const nameCell = row.insertCell(0);
                const formattedSpellName = spell.spellName.replace(/ /g, '-');
                nameCell.innerHTML = '<a href="' + dndBeyondSpells + formattedSpellName + '" target="_blank">' + spell.spellName + '</a>';
                const descCell = row.insertCell(1);
                descCell.innerHTML = spell.spellDescription;
                const levelCell = row.insertCell(2);
                levelCell.innerHTML = spell.spellLevel;
            });

            const items = playerObj.items;
            const itemsTable = document.getElementById('itemsTable');
            $('itemsTable').empty();
            items.forEach(item => {
                const row = itemsTable.insertRow();
                const nameCell = row.insertCell(0);
                nameCell.innerHTML = item.itemName;
                const descCell = row.insertCell(1);
                descCell.innerHTML = item.itemDescription;
            });
        }
    ).done(function() {
        $('.spinner').hide();
        $('.page.greyout').fadeOut();
    });
}

/*
 * Populates the htmlues in the character stats table using the values
 * from the db response
 */
function populateCharacterStats(stats) {
    $('#strengthVal').html(stats.strength);
    $('#dexVal').html(stats.dexterity);
    $('#constVal').html(stats.constitution);
    $('#intVal').html(stats.intelligence);
    $('#wisVal').html(stats.wisdom);
    $('#charVal').html(stats.charisma);
=======
>>>>>>> 86949eb6a20137de2bf3c2056d90b54bb9495a3c
}

/*
 * Add a description for the specified character to the database
 */
function addDescription(characterName, description) {
    const characterDescription = $('#description').val();
    $.post(
        localEndpoint + characterName + '/description',
        {
            characterDescription: characterDescription
        });
}

/*
 * Add an item to the table and database
 */
function addItem(characterName) {
    const table = document.getElementById('itemsTable');
    const itemName = $('#itemName').val();
    const itemDescription = $('#itemDescription').val();
    addElementToTable(table, itemName, itemDescription);
    $.post(
        localEndpoint + characterName + '/items',
        {
            itemName: itemName,
            itemDescription: itemDescription
        });

    closeItemsForm();
    return false;
}

/*
 * Add a spell to the table and database
 */
function addSpell(characterName) {
    const table = document.getElementById('spellsTable');
    const spellName = $('#spellName').val();
    const spellDescription = $('#spellDescription').val();
    const spellLevel = $('#spellLevel').val();
    addElementToTable(table, spellName, spellDescription, spellLevel);
    $.post(
        localEndpoint + characterName + '/spells',
        {
            spellName: spellName,
            spellDescription: spellDescription,
            spellLevel: spellLevel
        });

    closeSpellsForm();
    return false;
}

function addElementToTable(table, ...tableEntries) {
    const newRow = table.insertRow();
    tableEntries.forEach(entry => {
        const newCell = newRow.insertCell();
        newCell.innerHTML = entry;
    });
}

function openItemsForm() {
    document.getElementById('itemInfoForm').style.display = 'block';
}

function openSpellsForm() {
    document.getElementById('spellInfoForm').style.display = 'block';
}

function closeItemsForm() {
    document.getElementById('itemInfoForm').style.display = 'none';
}

function closeSpellsForm() {
    document.getElementById('spellInfoForm').style.display = 'none';
}

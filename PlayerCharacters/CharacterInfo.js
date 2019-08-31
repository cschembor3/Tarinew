const playersEndpoint = "https://boiling-sea-30343.herokuapp.com/players/";
const localEndpoint = "http://localhost:12345/players/";
const dndBeyondSpells = "https://www.dndbeyond.com/spells/";

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-top-center",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut"
};

/*
 * Get the character info, and populate the tables
 */
function getCharacterInfo(characterName) {
  $(".spinner").show();
  $(".page.greyout").fadeIn();
  $.get(localEndpoint + characterName, function(data) {
    data = JSON.stringify(data);
    const playerObj = JSON.parse(data);
    document.getElementById("level").append(playerObj.characterInfo.level);
    $("#description").html(playerObj.characterInfo.description);
    populateCharacterStats(playerObj.characterInfo.stats);
    $("#description").val(playerObj.characterInfo.description);
    const dndBeyondSpells = "https://www.dndbeyond.com/spells/";
    const spells = playerObj.spells;
    const spellTable = document.getElementById("spellsTable");
    $("spellTable").empty();
    spells.forEach(spell => {
      const row = spellTable.insertRow();
      const nameCell = row.insertCell(0);
      const formattedSpellName = spell.spellName.replace(/ /g, "-");
      nameCell.innerHTML =
        '<a href="' +
        dndBeyondSpells +
        formattedSpellName +
        '" target="_blank">' +
        spell.spellName +
        "</a>";
      const descCell = row.insertCell(1);
      descCell.innerHTML = spell.spellDescription;
      const levelCell = row.insertCell(2);
      levelCell.innerHTML = spell.spellLevel;
    });

    const items = playerObj.items;
    const itemsTable = document.getElementById("itemsTable");
    $("itemsTable").empty();
    items.forEach(item => {
      const row = itemsTable.insertRow();
      const nameCell = row.insertCell(0);
      nameCell.innerHTML = item.itemName;
      const descCell = row.insertCell(1);
      descCell.innerHTML = item.itemDescription;
    });
  }).done(function() {
    $(".spinner").hide();
    $(".page.greyout").fadeOut();
  });
}

/*
 * Populates the htmlues in the character stats table using the values
 * from the db response
 */
function populateCharacterStats(stats) {
  $("#strengthVal").html(stats.strength);
  $("#strengthMod").html(calculateModifier(stats.strength));
  $("#dexVal").html(stats.dexterity);
  $("#dexMod").html(calculateModifier(stats.dexterity));
  $("#constVal").html(stats.constitution);
  $("#constMod").html(calculateModifier(stats.constitution));
  $("#intVal").html(stats.intelligence);
  $("#intMod").html(calculateModifier(stats.intelligence));
  $("#wisVal").html(stats.wisdom);
  $("#wisMod").html(calculateModifier(stats.wisdom));
  $("#charVal").html(stats.charisma);
  $("#charMod").html(calculateModifier(stats.charisma));
}

/*
 * Add a description for the specified character to the database
 */
function addDescription(characterName, description) {
  const characterDescription = $("#description").val();
  $.post(localEndpoint + characterName + "/description", {
    characterDescription: characterDescription
  })
    .done(function() {
      toastr["success"]("Description updated", "Update Successful!");
    })
    .fail(function() {
      toastr["error"]("Please try again", "Update Failure...");
    });
}

/*
 * Add an item to the table and database
 */
function addItem(characterName) {
  const table = document.getElementById("itemsTable");
  const itemName = $("#itemName").val();
  const itemDescription = $("#itemDescription").val();
  addElementToTable(table, itemName, itemDescription);
  $.post(localEndpoint + characterName + "/items", {
    itemName: itemName,
    itemDescription: itemDescription
  })
    .done(function() {
      toastr["success"]("Item added", "Update Successful!");
    })
    .fail(function() {
      toastr["error"]("Please try again", "Update Failure...");
    });

  closeItemsForm();
  return false;
}

/*
 * Add a spell to the table and database
 */
function addSpell(characterName) {
  const table = document.getElementById("spellsTable");
  const spellName = $("#spellName").val();
  const spellDescription = $("#spellDescription").val();
  const spellLevel = $("#spellLevel").val();
  addElementToTable(table, spellName, spellDescription, spellLevel);
  $.post(localEndpoint + characterName + "/spells", {
    spellName: spellName,
    spellDescription: spellDescription,
    spellLevel: spellLevel
  })
    .done(function() {
      toastr["success"]("Spell added", "Update Successful!");
    })
    .fail(function() {
      toastr["error"]("Please try again", "Update Failure...");
    });

  closeSpellsForm();
  return false;
}

/*
 * Makes the stats table 'stat' column editable
 */
function editStat(statValElems, tableSelector) {
  $(statValElems).css({
    border: "1px red",
    "border-style": "double"
  });

  const table = $(tableSelector);
  const rows = table[0].rows;
  for (i = 1; i < rows.length; i++) {
    const statValCell = rows[i].cells[1];
    statValCell.contentEditable = "true";
  }
}

/*
 * Update player stats upon saving
 */
function updatePlayerStats(playerId, tableSelector, statValElems) {
  const tableRows = $(tableSelector)[0].rows;
  const stats = {
    strength: tableRows[1].cells[1].textContent,
    dexterity: tableRows[2].cells[1].textContent,
    constitution: tableRows[3].cells[1].textContent,
    intelligence: tableRows[4].cells[1].textContent,
    wisdom: tableRows[5].cells[1].textContent,
    charisma: tableRows[6].cells[1].textContent
  };

  updatePlayerStatsInDb(playerId, stats);
  closeStatEditing(statValElems, tableSelector);
}

/*
 * Turns the stats table 'stat' column back to being un-editable
 */
function closeStatEditing(statValElems, tableSelector) {
  $(statValElems).css({
    border: "1px solid #ddd",
    "border-style": "single"
  });

  const rows = $(tableSelector)[0].rows;
  for (i = 1; i < rows.length; i++) {
    const statValCell = rows[i].cells[1];
    statValCell.contentEditable = "false";
  }
}

/*
 * Update a players stat values
 */
function updatePlayerStatsInDb(playerId, stats) {
  const endpoint = localEndpoint + playerId + "/stats";

  $.post(endpoint, stats)
    .done(function() {
      toastr["success"]("Player stats updated", "Update Successful!");
    })
    .fail(function() {
      toastr["error"]("Please try again", "Update Failure...");
    });
}

function put(url, data) {
  $.ajax({
    url: url,
    type: "PUT",
    data: data,
    contentType: "application/json"
  });
}

function addElementToTable(table, ...tableEntries) {
  const newRow = table.insertRow();
  tableEntries.forEach(entry => {
    const newCell = newRow.insertCell();
    newCell.innerHTML = entry;
  });
}

function openItemsForm() {
  document.getElementById("itemInfoForm").style.display = "block";
}

function openSpellsForm() {
  document.getElementById("spellInfoForm").style.display = "block";
}

function closeItemsForm() {
  document.getElementById("itemInfoForm").style.display = "none";
}

function closeSpellsForm() {
  document.getElementById("spellInfoForm").style.display = "none";
}

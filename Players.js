import { get } from "https";

function getPlayerCharacters() {
    $.ajax({url: 'https://boiling-sea-30343.herokuapp.com/', dataType: "json", success: function(data) {
        var html = "";
        var playerCharacters = JSON.parse(data);
        playerCharacters.forEach(element => {
            html += '<h3>${element.name}</h3>';
            html += '<h3>${element.race}</h3';
            html += '<h3>${element.class}</h3>';
            html += '<h3>${element.level}</h3>';
        });
    }});
}
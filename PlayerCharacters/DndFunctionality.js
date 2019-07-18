/*
 * Simulate the roll of a die
 */
function roll(num) {
    const rollResult = Math.ceil(Math.random() * num);
    const resultHeader = document.getElementById('result_d' + num);
    resultHeader.innerHTML = rollResult;
}
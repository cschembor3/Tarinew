/*
 * Initialize all dice buttons
 */
$(function() {
    $('.btn.dice').popover();
});

/*
 * Simulate the roll of a die
 */
function roll(btn, num) {
    const rollResult = Math.ceil(Math.random() * num);
    $(btn).attr('data-content', rollResult);
}
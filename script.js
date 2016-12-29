$(document).ready(() => {
  let button = $('#convert-button');
  button.on('click', (e) => {
    let inputText = $('#input-text');
    let inputJson = $.parseJSON($('#input-text').val());
    addSideSpaceDataTo(inputJson);
  });
});

function addSideSpaceDataTo(inputJson) {
  $.getJSON('densities.json', (densities) => {
    let jsonObject = inputJson;
    jsonObject.values.forEach((e, i) => {
      e.first_char.densities.left_top =
        densities[e.first_char.letter].left_top;
      e.first_char.densities.right_top =
        densities[e.first_char.letter].right_top;
      e.first_char.densities.left_bottom =
        densities[e.first_char.letter].left_bottom;
      e.first_char.densities.right_bottom =
        densities[e.first_char.letter].right_bottom;
      e.first_char.densities.left =
        densities[e.first_char.letter].left;
      e.first_char.densities.right =
        densities[e.first_char.letter].right;
      e.first_char.densities.all =
        densities[e.first_char.letter].all;
      e.first_char.densities.left_space =
        densities[e.first_char.letter].left_space;
      e.first_char.densities.right_space =
        densities[e.first_char.letter].right_space;

      e.second_char.densities.left_top =
        densities[e.second_char.letter].left_top;
      e.second_char.densities.right_top =
        densities[e.second_char.letter].right_top;
      e.second_char.densities.left_bottom =
        densities[e.second_char.letter].left_bottom;
      e.second_char.densities.right_bottom =
        densities[e.second_char.letter].right_bottom;
      e.second_char.densities.left =
        densities[e.second_char.letter].left;
      e.second_char.densities.right =
        densities[e.second_char.letter].right;
      e.second_char.densities.all =
        densities[e.second_char.letter].all;
      e.second_char.densities.left_space =
        densities[e.second_char.letter].left_space;
      e.second_char.densities.right_space =
        densities[e.second_char.letter].right_space;
    });
    setTimeout(() => {
      let output = $('#output-text');
      let jsonString = JSON.stringify(jsonObject);
      output.val(jsonString);
    }, 1000);
  });
}

$(document).ready(() => {
  let button = $('#convert-button');
  button.on('click', (e) => {
    let inputText = $('#input-text');
    let inputJson = $.parseJSON($('#input-text').val());
    addSideSpaceDataTo(inputJson);
  });
});

function addSideSpaceDataTo(inputJson) {
  $.getJSON('yourtypes-densities-HiraginoSans-W3.json', (densities) => {
    let jsonObject = inputJson;
    jsonObject.values.forEach((e, i) => {
        densities[e.first_char.letter].left_space;
      e.first_char.densities.right_space =
        densities[e.first_char.letter].right_space;
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

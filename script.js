$(document).ready(() => {
  let button = $('#convert-button');
  button.on('click', (e) => {
    let inputText = $('#input-text');
    let inputJson = $.parseJSON($('#input-text').val());
    addSideSpaceDataTo(inputJson);
  });
});

function addSideSpaceDataTo(inputJson) {
  let jsonObject = inputJson;
  console.log(jsonObject);
  jsonObject.values.forEach((e, i) => {
    e.first_char.densities.left_space = 300;
    e.first_char.densities.right_space = 200;
    e.second_char.densities.left_space = 100;
    e.second_char.densities.right_space = 100;
  });
  setTimeout(() => {
    let output = $('#output-text');
    let jsonString = JSON.stringify(jsonObject);
    console.log(jsonString);
    output.val(jsonString);
  }, 1000);
}

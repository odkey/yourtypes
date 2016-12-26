$(document).ready(() => {
  let button = $('#convert-button');
  button.on('click', (e) => {
    let inputText = $('#input-text');
    let inputJson = $.parseJSON($('#input-text').val());
    console.log(e);
  });
});

function addSideSpaceDataTo(inputJson) {
  
}

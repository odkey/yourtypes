// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';

class Training {
  constructor() {
    this.text =
      'ある日の事でございます。御釈迦様おしゃかさまは極楽の蓮池はすいけのふちを、独りでぶらぶら御歩きになっていらっしゃいました。池の中に咲いている蓮はすの花は、みんな玉のようにまっ白で、そのまん中にある金色きんいろの蕊ずいからは、何とも云えない好よい匂においが、絶間たえまなくあたりへ溢あふれて居ります。極楽は丁度朝なのでございましょう。';
    this.setTrainingText(this.text, this.enableCharsToBeDragged);
  }
  enableCharsToBeDragged() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    chars.forEach((element, index, array) => {
      if (index == 0) { return; }
      element.dragging = false;
      // Make drag events to each span elements
      element.addEventListener('mousedown', () => {
        element.dragging = true;
        element.pivot = element.clientX;
      });
      element.addEventListener('mouseup', () => {
        element.dragging = false;
        element.pivot = undefined;
      });
      element.addEventListener('mouseout', () => {
        element.dragging = false;
        element.pivot = undefined;
      });
      element.addEventListener('mousemove',(event) => {
        if (element.dragging) {
          const previous = array[index-1];
          let letterSpace = parseInt(previous.style.letterSpacing, 10);
            letterSpace += (event.clientX - element.pivot);
          previous.style.letterSpacing = letterSpace + 'px';
          element.pivot = event.clientX;
        }
      });
    });
  }
  setTrainingText(testText, callback) {
    ReactDOM.render(
      <TrainingSampleTextView text={testText} />,
      document.getElementsByClassName('kerning-training-field')[0],
      callback
    );
  }
}

let training = new Training();

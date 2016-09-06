// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';

// function toggleClass(element, className){
// if (!element || !className){
// return;
// }
// var classString = element.className, nameIndex = classString.indexOf(className);
// if (nameIndex == -1) {
// classString += ' ' + className;
// }
// else {
// classString = classString.substr(0, nameIndex) + classString.substr(nameIndex+className.length);
// }
// element.className = classString;
// }
import Util from '../../common/scripts/util.jsx';
class Training {
  constructor() {
    this.settings = {
      isEmBoxShown: false,
      isBoundingBoxShown: false
    }
    this.text =
      'ある日の事でございます。御釈迦様おしゃかさまは極楽の蓮池はすいけのふちを、独りでぶらぶら御歩きになっていらっしゃいました。池の中に咲いている蓮はすの花は、みんな玉のようにまっ白で、そのまん中にある金色きんいろの蕊ずいからは、何とも云えない好よい匂においが、絶間たえまなくあたりへ溢あふれて居ります。極楽は丁度朝なのでございましょう。';
    this.setTrainingText(this.text, () => {
      this.enableCharsToBeDragged();
      this.prepareEmBoxRect();
    });
    this.addUIEvents();
  }
  addUIEvents() {
    this.addEmBoxEvent();
    this.addBoundingBoxEvent();
  }
  addEmBoxEvent() {
    let _this = this;
    let check = document.getElementsByName('field-setting-em-box')[0];
    check.addEventListener('change', (event) => {
      _this.settings.isEmBoxShown = event.target.checked;
      Util.toggleClass(
        document.getElementsByClassName('kerning-training-field-chars')[0],
        'hide-em-boxes');
      if (_this.settings.isEmBoxShown) {

      }
      else {

      }
    });
  }
  addBoundingBoxEvent() {
    let _this = this;
    let check = document.getElementsByName('field-setting-bounding-box')[0];
    check.addEventListener('change', (event) => {
      _this.settings.isBoundingBoxShown = event.target.checked;
      Util.toggleClass(document.getElementsByClassName('kerning-training-field-chars')[0],
      'hide-bounding-boxes');
      if (_this.settings.isBoundingBoxShown) {

      }
      else {

      }
    });
  }
  setTrainingText(testText, callback) {
    ReactDOM.render(
      <TrainingSampleTextView text={testText} />,
      document.getElementsByClassName('kerning-training-field')[0],
      callback
    );
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
  prepareEmBoxRect() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    chars.forEach((element, index, array) => {
      element.emBoxGeo = {
        width: element.getClientRects()[0].width,
        height: element.getClientRects()[0].height
      }
    });
  }
}

let training = new Training();

// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import request from 'request';
import JSZip from 'jszip';
import FileServer from 'file-server';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';

import Util from '../../common/scripts/util.jsx';

class Training {
  constructor() {
    this.settings = {
      isEmBoxShown: false,
      isBoundingBoxShown: false
    }
    this.kernedChars = [];
    this.zip = new JSZip();
    this.sampleWords = {
      words: require('../../data/sample_text/kumo_no_ito/data.json')["words"],
      index: 0
    }
    this.text = this.sampleWords.words[this.sampleWords.index];
    console.log('main', this.text);
    this.setTrainingText(this.text, () => {
      this.setTrainingTextCallback()
    });
    this.addUIEvents();
  }
  addUIEvents() {
    this.addEmBoxEvent();
    this.addBoundingBoxEvent();
    this.addExportCharImagesEvent();
    this.addAdvanceSampleWordEvent();
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
      Util.toggleClass(
        document.getElementsByClassName('kerning-training-field-chars')[0],
        'hide-bounding-boxes');
      if (_this.settings.isBoundingBoxShown) {

      }
      else {

      }
    });
  }
  addExportResultJSONEvent() {
    let button = document.getElementsByClassName('export-as-json')[0];

  }
  addExportCharImagesEvent() {
    let _this = this;
    let button = document.getElementsByClassName('export-char-images')[0];
    button.addEventListener('click', (event) => {
      this.saveCharsAsImages();
    });
  }
  addAdvanceSampleWordEvent() {
    let _this = this;
    let button = document.getElementsByClassName('kerning-training-ui-next')[0];
    button.addEventListener('click', (event) => {
      this.advanceSampleWord();
    });
  }
  setTrainingText(testText, callback) {
    document.getElementsByClassName('kerning-training-field')[0].innerHTML = '';
    ReactDOM.render(
      <TrainingSampleTextView text={ testText } />,
      document.getElementsByClassName('kerning-training-field')[0],
      callback
    );
  }
  setTrainingTextCallback() {
    this.prepareCharImageZip();
    this.enableCharsToBeDragged();
    this.prepareEmBoxRect();
    console.log(this.zip);
  }
  prepareCharImageZip() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let promises = [];
    chars.forEach((element, index, array) => {
      promises.push(this.convert_to_zip_item(element, index));
    });
    // promises.push(this.advance_word());
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());
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
  saveCharsAsSimpleImages() {
    // const folder =
  }
  saveCharsAsImages() {
    const folder =
      document.getElementsByClassName('font-selector-items')[0].value;
    this.zip.generateAsync({ type: 'blob' })
      .then((blob) => {
        saveAs(blob, `${ folder }.zip`);
      });
  }
  convert_to_zip_item(element, index) {
    return () => {
      return new Promise((resolve, reject) => {
        html2canvas(element, {
          onrendered: (canvas) => {
            let savable = new Image();
            savable.src = canvas.toDataURL();
            let options = {
              base64: true
            };
            this.zip.file(`${ element.innerText }.png`,
                     savable.src.split(',')[1],
                     options);
            resolve();
          }
        });
      });
    };
  }

  advance_word() {
    return () => {
    //   return new Promise((resolve, reject) => {
        this.text = this.sampleWords.words[++this.sampleWords.index];
        this.setTrainingText(this.text, () => {
          this.setTrainingTextCallback();
          // this.enableCharsToBeDragged();
          // this.prepareEmBoxRect();
          // console.log(this.zip);
          // resolve();
        });
    //   });
    }
  }
  advanceSampleWord() {
    if (this.sampleWords.index == this.sampleWords.words.length-1) {
      this.sampleWords.index = -1;
    }
    this.text = this.sampleWords.words[++this.sampleWords.index];
    this.setTrainingText(this.text, () => {
      this.setTrainingTextCallback();
    });
    // const folder =
    //   document.getElementsByClassName('font-selector-items')[0].value;
    // const container =
    //   document.getElementsByClassName('kerning-training-field-chars')[0];
    // let chars = container.childNodes;
    // let promises = [];
    // chars.forEach((element, index, array) => {
    //   promises.push(this.convert_to_zip_item(element, index));
    // });
    // promises.push(this.advance_word());
    // promises.reduce((prev, curr, index, array) => {
    //   return prev.then(curr);
    // }, Promise.resolve());
    // this.advance_word();
  }
}

let training = new Training();

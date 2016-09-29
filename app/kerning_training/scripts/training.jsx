// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');

import JSZip from 'jszip';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import fontManager from 'font-manager';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';
import FontSelectorView from './view/font_selector_view.jsx';

import Util from '../../common/scripts/util.jsx';

class Training {
  constructor() {
    this.settings = {
      isEmBoxShown: false,
      isBoundingBoxShown: false
    }
    // To make a dropbox contains all fonts your system has
    this.initFontSelector(() => {
      // Followings are callback functions
      this.addFontSelectEvent();
      this.applyFontToField();
    });
    // Result data
    this.kernedChars = [];
    this.result = {
      'values': new Array()
    };
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
    this.addFontSizeInputEvent();
    this.addExportResultJSONEvent();
    this.addExportCharImagesEvent();
    this.addAdvanceSampleWordEvent();
  }
  addFontSizeInputEvent() {
    let input = document.getElementsByName('font-size-input')[0];
    input.addEventListener('change', (event) => {
      this.setKerningFieldFontSize(event.target.value);
    });
  }
  addFontSelectEvent() {
    let _this = this;
    let selector = document.getElementsByClassName('font-selector-items')[0];
    selector.addEventListener('change', (event) => {
      let selected = selector.options[selector.selectedIndex];
      let name = selected.dataset.postscriptname;
      let path = selected.dataset.path;
      this.setKerningFieldFontStyle(name, path);
    });
  }
  addExportResultJSONEvent() {
    let button = document.getElementsByName('export-as-json')[0];
    button.addEventListener('click', (event) => {
      this.exportResultJSON();
    });
  }
  addExportCharImagesEvent() {
    let _this = this;
    let button = document.getElementsByName('export-char-images')[0];
    button.addEventListener('click', (event) => {
      this.saveCharsAsImages();
    });
  }
  addAdvanceSampleWordEvent() {
    let _this = this;
    let button = document.getElementsByName('kerning-training-ui-next')[0];
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
    // To add rendered chars to zip object
    this.prepareCharImageZip();
    // To make the text draggable
    this.enableCharsToBeDragged();
    // Initial font size of the kerning field is 50px
    this.setKerningFieldFontSize(50);
  }
  prepareCharImageZip() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let promises = [];
    chars.forEach((element, index, array) => {
      promises.push(this.convert_to_zip_item(element, index));
    });
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
  prepareResultJSON() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    chars.forEach((element, index, array) => {
      if (index == array.length-1) { return; }
      this.result.values.push({
        'first_char': element.textContent,
        'second_char': array[index+1].textContent,
        'kerning_value': parseInt(element.style['letter-spacing'].substr('px'))
      });
      console.log(this.result);
    });
  }
  exportResultJSON() {
    let fontSelector =
      document.getElementsByClassName('font-selector-items')[0];
    let selected = fontSelector.options[fontSelector.selectedIndex];
    this.result['info'] = {
      path: selected.dataset.path,
      style: selected.dataset.style,
      family: selected.dataset.family,
      weight: selected.dataset.weight,
      italic: selected.dataset.italic,
      monospace: selected.dataset.monospace,
      postscript_name: selected.dataset.postscriptname
    }
    let datasetName =
      document.getElementsByName('dataset-name')[0].value;
    let filename;
    if (datasetName != ''){
      filename =
        `yourtypes-${ datasetName }-${ this.result.info.postscript_name }`;
    }
    else {
      filename =
        `yourtypes-${ this.result.info.postscript_name }`;
    }
    console.log(filename);
    let blob =
      new Blob([JSON.stringify(this.result)], { type: 'application/json' });
      saveAs(blob, filename);
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
            this.zip.file(`${ element.textContent }.png`,
                     savable.src.split(',')[1],
                     options);
            resolve();
          }
        });
      });
    };
  }
  advanceSampleWord() {
    this.prepareResultJSON();
    if (this.sampleWords.index == this.sampleWords.words.length-1) {
      this.sampleWords.index = -1;
      // Add event!!
    }
    this.text = this.sampleWords.words[++this.sampleWords.index];
    this.setTrainingText(this.text, () => {
      this.setTrainingTextCallback();
    });
  }
  initFontSelector(callback) {
    fontManager.getAvailableFonts((fonts) => {
      let fonts_sort_condition = (font1, font2) => {
        if (font1.postscriptName < font2.postscriptName) { return -1; }
        if (font1.postscriptName > font2.postscriptName) { return 1; }
        return 0;
      }
      ReactDOM.render(
        <FontSelectorView fonts={ fonts.sort(fonts_sort_condition) } />,
        document.getElementsByClassName('font-selector')[0],
        callback
      );
    });
  }
  applyFontToField() {
    let selector = document.getElementsByClassName('font-selector-items')[0];
    let selected = selector.options[selector.selectedIndex];
    console.log(selected);
    this.setKerningFieldFontStyle(selected.dataset.postscriptname,
                                  selected.dataset.path);
  }
  setKerningFieldFontStyle(name, path) {
    let className = 'additional-font-face-style-tag';
    Util.deleteElementWithClassName(className);
    let style = document.createElement('style');
    style.className = className;
    style.appendChild(document.createTextNode(
      `@font-face {
         font-family: ${ name };
         src: url(${ path });
       }`));
    document.head.appendChild(style);
    let field =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    field.style.fontFamily = name;
  }
  setKerningFieldFontSize(size) {
      let field =
        document.getElementsByClassName('kerning-training-field-chars')[0];
      field.style.fontSize = `${ size }px`;
  }
}

let training = new Training();

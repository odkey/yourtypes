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
    this.isStayPhase = true;
    this.isDataReady = false;
    // To make a dropbox contains all fonts your system has
    this.initFontSelector(() => {
      // Followings are callback functions
      this.addFontSelectEvent();
      this.applyFontToField();
    });
    // Result data
    this.kernedChars = new Array();
    this.result = {
      'values': new Array()
    };
    // Char images
    this.images = new Array();
    this.densities = undefined;
    this.zip = new JSZip();
    this.sampleWords = {
      words: require('../../data/sample_text/kumo_no_ito/data.json')["words"],
      index: 0
    }
    this.text = this.sampleWords.words[this.sampleWords.index];
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
    this.addKerningSamplingFinishEvent();
    this.addMergingDensityIntoLetterSpaceEvent();
  }
  addMergingDensityIntoLetterSpaceEvent() {
    let button =
      document.getElementsByName('merge-density-into-letter-space')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase || !this.isDataReady) { return; }
      this.mergeDensitiesIntoLetterSpaceData();
      this.isDataReady = true;
    });
  }
  addKerningSamplingFinishEvent() {
    let button = document.getElementsByName('finish-kerning-sampling')[0];
    button.addEventListener('click', (event) => {
      if (this.isStayPhase || this.isDataReady) { return; }
      this.prepareResultJSON();
      this.analyseCharDensities();
      this.isStayPhase = true;
      // this.mergeDensitiesIntoLetterSpaceData();
    });
  }
  addFontSizeInputEvent() {
    let input = document.getElementsByName('font-size-input')[0];
    input.addEventListener('change', (event) => {
      if (!this.isStayPhase || this.isDataReady) { return; }
      this.setKerningFieldFontSize(event.target.value);
    });
  }
  addFontSelectEvent() {
    let _this = this;
    let selector = document.getElementsByClassName('font-selector-items')[0];
    selector.addEventListener('change', (event) => {
      if (!this.isStayPhase || this.isDataReady) { return; }
      let selected = selector.options[selector.selectedIndex];
      let name = selected.dataset.postscriptname;
      let path = selected.dataset.path;
      this.setKerningFieldFontStyle(name, path);
    });
  }
  addExportResultJSONEvent() {
    let button = document.getElementsByName('export-as-json')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase || !this.isDataReady) { return; }
      this.exportResultJSON();
    });
  }
  addExportCharImagesEvent() {
    let _this = this;
    let button = document.getElementsByName('export-char-images')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase || !this.isDataReady) { return; }
      this.saveCharsAsImages();
    });
  }
  addAdvanceSampleWordEvent() {
    let _this = this;
    let button = document.getElementsByName('kerning-training-ui-next')[0];
    button.addEventListener('click', (event) => {
      if (this.isStayPhase || this.isDataReady) { return; }
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
    // To store chars as images
    this.storeCharImages();
    // To add rendered chars to zip object
    this.prepareCharImageZip();
    // To make the text draggable
    this.enableCharsToBeDragged();
    // Initial font size of the kerning field is 50px
    // this.setKerningFieldFontSize(50);
  }
  storeCharImages() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    // this.images = chars.cloneNode(true);
    chars.forEach((element, index) => {
      html2canvas(element, {
        onrendered: (canvas) => {
          let image = new Image();
          image.src = canvas.toDataURL();
          let object = {
            img: image,
            char: element.textContent
          };
          this.images.push(object);
        }
      });
    });
  }
  analyseCharDensities() {
    console.log('Start to analying char densities.');
    this.densities = {};
    this.images.forEach((element, index) => {
      let canvas = document.createElement('canvas');
      if (!canvas || !canvas.getContext) {
        console.log('error: canvas is not found');
        return;
      }
      let image = new Image();
      let context = canvas.getContext('2d');
      image.src = `${ element.img.src }`;
      image.onload = () => {
        context.drawImage(image, 0, 0, image.width, image.height);
        let imageData =
          context.getImageData(0, 0, image.width, image.height);
        let pixels = imageData.data;
        let sumBlack = 0;
        let density = 0;
        let sum_up = (element, index) => {
          return () => {
            return new Promise((resolve, reject) => {
              sumBlack += element/255.0;
              resolve();
            });
          }
        }
        let promises = [];
        pixels.forEach((element, index) => {
          if (index%4 != 3) { return; }
          promises.push(sum_up(element, index));
        });
        promises.push(() => {
          density = sumBlack / (image.width*image.height);
          this.densities[element.char] = density;
        });
        promises.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      }
    });
  }
  mergeDensitiesIntoLetterSpaceData() {
    console.log('Start to merge density data into letter space data.');
    let fontsize =
      parseFloat(document.getElementsByName('font-size-input')[0].value);
    let merge = (element, index) => {
      return () => {
        return new Promise((resolve, reject) => {
          let firstDensity = this.densities[element['first_char']];
          let secondDensity = this.densities[element['second_char']];
          element['first_density'] = firstDensity;
          element['second_density'] = secondDensity;
          element['letter_space'] = element['kerning_value'];
          element['letter_space_rate'] = element['kerning_value']/fontsize;
          console.log(element);
          resolve();
        });
      }
    }
    let promises = [];
    this.result.values.forEach((element, index, array) => {
      promises.push(merge(element, index));
    });
    promises.push(() => {
      console.log(this.result);
    });
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());

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
    let size =
      document.getElementsByName('font-size-input')[0].value;
    console.log(size);
    let fontSelector =
      document.getElementsByClassName('font-selector-items')[0];
    let selected = fontSelector.options[fontSelector.selectedIndex];
    this.result['info'] = {
      size: size,
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

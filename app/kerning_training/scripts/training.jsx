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
    this.isTextRendered = false;
    this.isImagesStored = false;
    this.isDraggable = false;
    this.isFontSet = false;
    this.isSizeSet = false;
    this.isStayPhase = true;
    this.isDataPrepared = false;
    this.isDataAnalysed = false;
    this.isDataMerged = false;
    this.isDataMerging = false;
    this.isDataAnalysing = false;
    this.isImagesStoring = false;
    this.isDataPreparing = false;
    // To make a dropbox contains all fonts your system has
    this.initFontSelector(() => {
      // Followings are callback functions
      this.addFontSelectEvent();
      this.applyFontToField();
      this.setKerningFieldFontSize(50);
    });
    // To set font size
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
      this.enableCharsToBeDragged();
    });
    this.addUIEvents();
    // When some process is running, loading curtain is drawn to reject user input
    this.isLastPhaseStay = this.isStayPhase;
    this.curtain =
      document.getElementsByClassName('loading-curtain')[0];
    this.startButtonWrapper =
      document.getElementsByClassName('sampling-ui-start')[0];
    this.finishButtonWrapper =
      document.getElementsByClassName('sampling-ui-finish')[0];
    this.nextButtonWrapper =
      document.getElementsByClassName('sampling-ui-next')[0];
    this.exportJSONButtonWrapper =
      document.getElementsByClassName('export-as-json')[0];
    this.exportImagesButtonWrapper =
      document.getElementsByClassName('export-char-images')[0];
    let interval = setInterval(() => {
      if (this.is_operation_allowed()) {
        Util.addClass(this.curtain, 'hidden');
      }
      if (this.isStayPhase != this.isLastPhaseStay) {
        Util.toggleClass(this.startButtonWrapper, 'hidden');
        Util.toggleClass(this.finishButtonWrapper, 'hidden');
        Util.toggleClass(this.nextButtonWrapper, 'hidden');
        Util.toggleClass(this.exportJSONButtonWrapper, 'hidden');
        Util.toggleClass(this.exportImagesButtonWrapper, 'hidden');
        this.isStayPhase?
          this.enableFontSelector(): this.disableFontSelector();
      }
      this.isLastPhaseStay = this.isStayPhase;
    }, 5);

  }
  addUIEvents() {
    this.addFontSizeInputEvent();
    this.addExportResultJSONEvent();
    this.addExportCharImagesEvent();
    this.addAdvanceSampleWordEvent();
    this.addKerningSamplingFinishEvent();

    this.addSamplingStartEvent();
  }
  addSamplingStartEvent() {
    let button =
      document.getElementsByName('sampling-ui-start')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase) { return; }
      // Start to draw loading curtain
      Util.removeClass(this.curtain, 'hidden');

      this.resetData();
      this.isStayPhase = false;
      this.storeCharImages();
      let interval = setInterval(() => {
        if (this.isTextRendered) {
          console.log('Those chars are stored.', this.images);
          clearInterval(interval);
        }
      }, 10);
    });
  }
  resetData() {
    this.isDataPrepared = false;
    this.isDataPreparing = true;
    this.result = { values: new Array() };
    this.images = new Array();
    this.densities = undefined;
    this.isDataPreparing = false;
  }
  addKerningSamplingFinishEvent() {
    let button = document.getElementsByName('sampling-ui-finish')[0];
    button.addEventListener('click', (event) => {
      // Init text
      let fontsize =
        document.getElementsByName('font-size-input')[0].value;
      this.sampleWords.index = 0;
      this.text = this.sampleWords.words[this.sampleWords.index];
      this.setTrainingText(this.text, () => {
        this.enableCharsToBeDragged();
        this.applyFontToField();
        this.setKerningFieldFontSize(fontsize);
        // Preparing to export text
        this.finishSampling();
      });
    });
  }
  addFontSizeInputEvent() {
    let input = document.getElementsByName('font-size-input')[0];
    input.addEventListener('change', (event) => {
      if (!this.isStayPhase) { return; }
      this.setKerningFieldFontSize(event.target.value);
    });
  }
  addFontSelectEvent() {
    let selector = document.getElementsByClassName('font-selector-items')[0];
    selector.addEventListener('change', (event) => {
      if (!this.isStayPhase) { return; }
      this.isFontSet = false;
      let selected = selector.options[selector.selectedIndex];
      let name = selected.dataset.postscriptname;
      let path = selected.dataset.path;
      this.setKerningFieldFontStyle(name, path);
    });
  }
  addExportResultJSONEvent() {
    let button = document.getElementsByName('export-as-json')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase ||
          !this.isImagesStored ||
          !this.isDataPrepared) { return; }
      this.exportResultJSON();
    });
  }
  addExportCharImagesEvent() {
    let button = document.getElementsByName('export-char-images')[0];
    button.addEventListener('click', (event) => {
      if (!this.isStayPhase) { return; }
      this.saveCharsAsImages();
    });
  }
  addAdvanceSampleWordEvent() {
    let button = document.getElementsByName('sampling-ui-next')[0];
    button.addEventListener('click', (event) => {
      Util.removeClass(this.curtain, 'hidden');
      this.advanceSampleWord();
    });
  }
  setTrainingText(testText, callback) {
    this.isTextRendered = false;
    document.getElementsByClassName('kerning-training-field')[0].innerHTML = '';
    ReactDOM.render(
      <TrainingSampleTextView text={ testText } />,
      document.getElementsByClassName('kerning-training-field')[0],
      () => {
        this.isTextRendered = true;
        callback();
      }
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
  finishSampling() {
    if (this.isStayPhase) { return; }
    this.isDataPreparing = true;
    this.isDataAnalysing = true;
    this.isDataMerging = true;
    Util.removeClass(this.curtain, 'hidden');
    this.prepareResultJSON();
    let interval1 = setInterval(() => {
      if (this.isDataPrepared) {
        this.analyseCharDensities();
        let interval2 = setInterval(() => {
          if (this.isDataAnalysed) {
            this.mergeDensitiesIntoLetterSpaceData();
            let interval3 = setInterval(() => {
              if (this.isDataMerged) {
                this.isStayPhase = true;
                clearInterval(interval3);
              }
            }, 100);
            clearInterval(interval2);
          }
        }, 100);
        clearInterval(interval1);
      }
    }, 100);
  }
  storeCharImages() {
    this.isTextRendered = false;
    this.isImagesStored = false;
    this.isImagesStoring = true;
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let runningCount = 0;
    chars.forEach((element, index, array) => {
      html2canvas(element, {
        onrendered: (canvas) => {
          let image = new Image();
          image.src = canvas.toDataURL();
          let object = {
            img: image,
            char: element.textContent
          };
          this.images.push(object);
          runningCount++;
          if (runningCount == array.length) {
            this.isImagesStoring = false;
            this.isImagesStored = true;
            this.isTextRendered = this.is_text_rendered();
          }
        }
      });
    });
  }
  analyseCharDensities() {
    console.log('Start to analying char densities.');
    this.isDataAnalysed = false;
    this.isDataAnalysing = true;
    this.densities = {};
    this.runningCount = 0;
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
          this.runningCount++;
          if (this.runningCount == this.images.length) {
            this.isDataAnalysed = true;
            this.isDataAnalysing = false;
            console.log('Data is analysed', this.densities);
          }
        });
        promises.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      }
    });
  }
  mergeDensitiesIntoLetterSpaceData() {
    console.log('Start to merge density data into letter space data.');
    this.isDataMerged = false;
    this.isDataMerging = true;
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
          resolve();
        });
      }
    }
    let promises = [];
    this.result.values.forEach((element, index, array) => {
      promises.push(merge(element, index));
    });
    promises.push(() => {
      console.log('Data is merged', this.result);
      this.isDataMerged = true;
      this.isDataMerging = false;
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
    this.isTextRendered = false;
    this.isDraggable = false;
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let runningCount = 0;
    chars.forEach((element, index, array) => {
      if (index == 0) {
        runningCount++;
      }
      else {
        element.dragging = false;
        // Make drag events to each span elements
        element.addEventListener('mousedown', () => {
          if (!this.isTextRendered || this.isStayPhase) { return; }
          element.dragging = true;
          element.pivot = element.clientX;
        });
        element.addEventListener('mouseup', () => {
          if (!this.isTextRendered || this.isStayPhase) { return; }
          element.dragging = false;
          element.pivot = undefined;
        });
        element.addEventListener('mouseout', () => {
          if (!this.isTextRendered || this.isStayPhase) { return; }
          element.dragging = false;
          element.pivot = undefined;
        });
        element.addEventListener('mousemove',(event) => {
          if (!this.isTextRendered || this.isStayPhase) { return; }
          if (element.dragging) {
            const previous = array[index-1];
            let letterSpace = parseInt(previous.style.letterSpacing, 10);
              letterSpace += (event.clientX - element.pivot);
            previous.style.letterSpacing = letterSpace + 'px';
            element.pivot = event.clientX;
          }
        });
        runningCount++;
      }
      if (runningCount == array.length) {
        this.isDraggable = true;
        this.isTextRendered = this.is_text_rendered();
      }
    });
  }
  // To push chars now drawn
  prepareResultJSON() {
    console.log('Start to prepare result JSON');
    this.isDataPrepared = false;
    this.isDataPreparing = true;
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let runningCount = 0;
    chars.forEach((element, index, array) => {
      if (index == array.length-1) {
        runningCount++;
      }
      else {
        this.result.values.push({
          'first_char': element.textContent,
          'second_char': array[index+1].textContent,
          'kerning_value': parseInt(element.style['letter-spacing'].substr('px'))
        });
        runningCount++;
      }
      if (runningCount == array.length) {
        this.isDataPrepared = true;
        this.isDataPreparing = false;
      }
    });
  }
  exportResultJSON() {
    console.log('Is operation allowed', this.is_operation_allowed());
    let size =
      document.getElementsByName('font-size-input')[0].value;
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
    this.isTextRendered = false;
    this.isDataPreparing = true;
    this.isDataPrepared = false;
    this.isImagesStored = false;
    this.isImagesStoring = true;
    this.prepareResultJSON();
    let interval1 = setInterval(() => {
      if (this.isDataPrepared) {
        clearInterval(interval1);
        let fontsize =
          document.getElementsByName('font-size-input')[0].value;
        if (this.sampleWords.index == this.sampleWords.words.length-1) {
          // Storing images method is not needed when this text is a last smaple
          this.isImagesStored = true;
          this.isImagesStoring = false;
          // Init text
          this.sampleWords.index = 0;
          this.text = this.sampleWords.words[this.sampleWords.index];
          this.setTrainingText(this.text, () => {
            this.enableCharsToBeDragged();
            this.applyFontToField();
            this.setKerningFieldFontSize(fontsize);
            // Preparing to export data
            this.finishSampling();
            return;
          });
        }
        else {
          this.text = this.sampleWords.words[++this.sampleWords.index];
          this.setTrainingText(this.text, () => {
            this.enableCharsToBeDragged();
            this.applyFontToField();
            this.setKerningFieldFontSize(fontsize);
          });
          let interval2 = setInterval(() => {
            if (this.isTextRendered) {
              clearInterval(interval2);
              this.storeCharImages();
            }
          }, 100);
        }
      }
    }, 100);
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
    this.isTextRendered = false;
    this.isFontSet = false;
    console.log('applying font', this.isTextRendered);
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

    let interval = setInterval(() => {
      if (document.fonts.status == 'loaded') {
        this.isFontSet = true;
        this.isTextRendered = this.is_text_rendered();
        clearInterval(interval);
      }
    }, 100);
  }
  setKerningFieldFontSize(size) {
    this.isTextRendered = false;
    this.isSizeSet = false;
    let field =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    field.style.fontSize = `${ size }px`;
    this.isSizeSet = true;
    this.isTextRendered = this.is_text_rendered();
  }
  disableFontSelector() {
    let selector =
      document.getElementsByName('font-selector')[0];
    if (selector == undefined) { return; }
    selector.disabled = true;
  }
  enableFontSelector() {
    let selector =
      document.getElementsByName('font-selector')[0];
    if (selector == undefined) { return; }
    selector.disabled = false;
  }
  is_text_rendered() {
    return this.isFontSet && this.isSizeSet && this.isDraggable;
  }
  is_operation_allowed() {
    return !this.isDataPreparing && !this.isDataMerging &&
           !this.isDataAnalysing && !this.isImagesStoring &&
           this.is_text_rendered();
  }
}

let training = new Training();

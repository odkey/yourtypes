// YourTypes applying_editor/scripts/applying_editor.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import fs from 'fs';
import request from 'request';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import fontManager from 'font-manager';
import DesignedTextView from './view/designed_text_view.jsx';
import FontSelectorView from '../../common/scripts/font_selector_view.jsx';

import Util from '../../common/scripts/util.jsx';

const { remote } = require('electron');
const dialog = remote.dialog;

class ApplyingEditor {
  constructor() {
    this.isFontSet = false;
    this.isTextSet = false;
    this.isTextSetting = false;
    this.isSampledDataLoaded = false;
    this.isSampledDataLoading = false;
    this.isDataApplied = false;
    this.isDataApplying = false;
    this.isTextAnalysed = false;
    this.isTextAnalysing = false;
    this.isTextKerned = false;
    this.isTextKerning = false;
    this.isImagesStoring = false;
    this.isImagesStored = false;

    this.analysingCount = 0;

    this.sampledData = undefined;
    this.densities = undefined;
    this.nearest = undefined;
    this.fontInfo = {};
    this.images = new Array();

    this.initFontSelector(() => {
      this.addFontSelectEvent();
      this.isFontSet = false;
      this.applyFont();
    });
    this.addUIEvents();

    let interval = setInterval(() => {
      if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
        this.enableNewTextInput();
      }
      else {
        this.disableNewTextInput();
      }
    }, 100);
  }
  disableNewTextInput() {
    let textarea = document.getElementsByName('new-text-input')[0];
    if (textarea == undefined) { return; }
    textarea.disabled = true;
  }
  enableNewTextInput() {
    let textarea = document.getElementsByName('new-text-input')[0];
    if (textarea == undefined) { return; }
    textarea.disabled = false;
  }
  addUIEvents() {
    this.addNewTextInputEvent();
    this.addSampledDataJSONSelectEvent();
    // this.addApplyingDataToNewTextEvent();
  }
  addFontSelectEvent() {
    let selector = document.getElementsByClassName('font-selector-items')[0];
    selector.addEventListener('change', (event) => {
      // if (!this.isStayPhase) { return; }
      // this.isFontSet = false;
      let selected = selector.options[selector.selectedIndex];
      let name = selected.dataset.postscriptname;
      let path = selected.dataset.path;
      this.setFontStyle(name, path);
    });
  }
  applyFont() {
    let selector = document.getElementsByClassName('font-selector-items')[0];
    let selected = selector.options[selector.selectedIndex];
    this.setFontStyle(selected.dataset.postscriptname,
                                  selected.dataset.path);
  }
  setFontStyle(name, path) {
    // this.isTextRendered = false;
    this.isFontSet = false;
    // console.log('applying font', this.isTextRendered);
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
      document.getElementsByClassName('designed-text-field-chars')[0];

    let interval = setInterval(() => {
      if (field != undefined) {
        clearInterval(interval);
        field.style.fontFamily = name;
        this.isFontSet = true;
      }
    }, 100);
  }
  setDesignedText(text, callback) {
    document.getElementsByClassName('designed-text-field')[0].innerHTML = '';
    ReactDOM.render(
      <DesignedTextView text={ text }/>,
      document.getElementsByClassName('designed-text-field')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
  }
  addNewTextInputEvent() {
    let textarea = document.getElementsByName('new-text-input')[0];
    textarea.addEventListener('change', (event) => {
      let text = event.srcElement.value;
      this.isTextSet = false;
      this.isTextSetting = true;
      this.isFontSet = false;
      this.setDesignedText(text, () => { this.applyFont(); });
      if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
        this.isImagesStored = false;
        this.isImagesStoring = true;
        this.isTextAnalysed = false;
        this.isTextAnalysing = true;
        this.isDataApplied = false;
        this.isDataApplying = true;
        let interval = setInterval(() => {
          if (this.isTextSet && !this.isTextSetting && this.isFontSet) {
            clearInterval(interval);
            console.log('Store char images');
            this.storeCharImages();
            let interval2 = setInterval(() => {
              if (this.isImagesStored && !this.isImagesStoring) {
                clearInterval(interval2);
                console.log('Analyse chars stored into images');
                this.analyseCharImages();
                let interval3 = setInterval(() => {
                  if (this.isTextAnalysed && !this.isTextAnalysing) {
                    clearInterval(interval3);
                    console.log('Apply letter space data');
                    this.applyLetterSpaces();

                  }
                }, 100);
              }
            }, 100);
          }
        }, 100);
      }
    });
  }
  applyLetterSpaces() {
    this.isDataApplied = false;
    this.isDataApplying = true;
    let chars = document.getElementsByClassName(
      'designed-text-field-chars')[0].childNodes;
    let applyingCount = 0;
    chars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      let nearest = { squaredDistance: 0, index: -1 };
      let firstDensity = parseFloat(this.densities[array[index].textContent]);
      let secondDensity = parseFloat(this.densities[array[index+1].textContent]);
      let searchCount = 0;
      this.sampledData.forEach((element, index, array) => {
        let sampleFirstDenstiy = parseFloat(element.first_density);
        let sampleSecondDensity = parseFloat(element.second_density);
        let diffFirst = firstDensity - sampleFirstDenstiy;
        let diffSecond = secondDensity - sampleSecondDensity;
        let squaredDistance = diffFirst * diffFirst + diffSecond * diffSecond;
        if (searchCount == 0 || squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance};
        }
        searchCount++;
      });
      let interval = setInterval(() => {
        if (searchCount == this.sampledData.length) {
          clearInterval(interval);
          element.style.letterSpacing =
            `${ this.sampledData[nearest.index].letter_space_rate }em`;
          applyingCount++;
        }
      }, 100);
    });
    let interval = setInterval(() => {
      if (applyingCount == chars.length-1) {
        clearInterval(interval);
        this.isDataApplied = true;
        this.isDataApplying = false;
        console.log('Letter space data is applied');
      }
    }, 100);
  }
  analyseCharImages() {
    if (!this.isImagesStored) { return; }
    this.isTextAnalysed = false;
    this.isTextAnalysing = true;
    this.densities = {};
    this.analysingCount = 0;
    this.images.forEach((element, index, array) => {
      let canvas = document.createElement('canvas');
      if (!canvas || !canvas.getContext) {
        console.log('error: illegal canvas');
        return;
      }
      let image = new Image();
      let context = canvas.getContext('2d');
      image.src = `${ element.img.src }`;
      image.onload = () => {
        context.drawImage(image, 0, 0);
        let imageData = context.getImageData(0, 0, image.width, image.height);
        let pixels = imageData.data;
        let sumBlack = 0;
        let density = 0;
        let sum_up = (element, index) => {
          return () => {
            return new Promise((resolve) => {
              sumBlack += element/255.0;
              resolve();
            });
          }
        }
        let promises = new Array();
        pixels.forEach((element, index) => {
          if (index%4 != 3) { return; }
          promises.push(sum_up(element, index));
        });
        promises.push(() => {
          density = sumBlack / (image.width * image.height);
          this.densities[element.char] = density;
          this.analysingCount++;
          if (this.analysingCount == this.images.length) {
            this.isTextAnalysed = true;
            this.isTextAnalysing = false;
            console.log('New text is analysed', this.densities);
          }
        });
        promises.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      }
    });
  }
  storeCharImages() {
    this.isImagesStored = false;
    this.isImagesStoring = true;
    this.images = new Array();
    const container =
      document.getElementsByClassName('designed-text-field-chars')[0];
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
            this.isImagesStored = true;
            this.isImagesStoring = false;
            console.log('All chars are stored', this.images);
          }
        }
      });
    });
  }
  analyse_char(element, index) {
    return () => {
      return new Promise((resolve, reject) => {
        html2canvas(element, {
          onrendered: (canvas) => {
            const width = canvas.width;
            const height = canvas.height;
            let context = canvas.getContext('2d');
            let pixels =
              context.getImageData(0, 0, width, height).data;
            let sumBlack = 0;
            let density = 0;
            let charactor = element.innerText;
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
              density = sumBlack / (width * height);
              this.densities[charactor] = density;
            });
            promises.reduce((prev, curr, index, array) => {
              return prev.then(curr);
            }, Promise.resolve());
            resolve();
          }
        });
      });
    }
  }
  distance_square(pointX, pointY, pivotX, pivotY) {
    let diffX = pivotX - pointX;
    let diffY = pivotY - pointY;
    return  diffX * diffX + diffY * diffY;
  }
  analyseNewText() {
    let chars = document.getElementsByClassName(
      'designed-text-field-chars')[0].childNodes;
    if (chars.length < 2) { return; }
    this.isTextAnalysing = true;
    this.isTextAnalysed = false;
    this.densities = {};
    let runningCount = 0;
    let promises = [];
    chars.forEach((element, index, array) => {
      promises.push(this.analyse_char(element, index));
    });
    promises.push(() => {
      console.log('densities: ', this.densities);
      this.isTextAnalysing =false;
      this.isTextAnalysed = true;
    });
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());
  }
  loadSampledDataJSON() {
    this.sampledData = {};
    let focusedWindow = remote.getCurrentWindow();
    let options = {
      properties: [
        'openFile'
      ]
    };
    dialog.showOpenDialog(focusedWindow, options, (file) => {
      if (file == undefined ||
          file[0].indexOf('.json') != file[0].length-5) { return; }
      fs.readFile(file[0], 'utf8', (error, rawData) => {
        if (error) { return; }
        this.isSampledDataLoaded = false;
        this.isSampledDataLoading = true;
        this.sampledData = [];
        let json = JSON.parse(rawData);
        this.fontInfo = {
          size: json.info.size,
          path: json.info.path,
          style: json.info.style,
          family: json.info.family,
          weight: json.info.weight,
          italic: json.info.italic,
          monospace: json.info.monospace,
          postscriptName: json.info.postscript_name
        };
        // this.setFontStyle(this.fontInfo.postscriptName, this.fontInfo.path);
        // document.getElementsByClassName('designed-text-field')[0]
        //   .style
        //   .fontSize = this.fontInfo.size;
        let runningCount = 0;
        json.values.forEach((element, index) => {
          if (element.first_density > 0 && element.second_density > 0) {
            const item = {
              first_density: element.first_density,
              second_density: element.second_density,
              letter_space_rate: element.letter_space_rate
            };
            this.sampledData.push(item);
            runningCount++;
          }
        });
        let interval = setInterval(() => {
          if (runningCount == json.values.length) {
            this.isSampledDataLoaded = true;
            this.isSampledDataLoading = false;
            console.log('JSON loaded', this.sampledData);
            clearInterval(interval);
          }
        }, 100);
      });
    });
  }
  addSampledDataJSONSelectEvent() {
    let button = document.getElementsByName('sampled-data-json-selector')[0];
    button.addEventListener('click', (event) => {
      this.isSampledDataLoaded = false;
      this.isSampledDataLoading = true;
      this.loadSampledDataJSON();
      let interval = setInterval(() => {
        if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
          clearInterval(interval);
          if (this.isTextSet && !this.isTextSetting) {
            // console.log('Start applying data to new text');
            // this.applyDataToNewText();
          }
        }
      }, 100);
    });
  }
  applyDataToNewText() {
    this.isTextKerning = true;
    this.isTextKerned = false;
    if (!this.isTextSet || this.isTextSetting ||
        !this.isTextAnalysed || this.isTextAnalysing ||
        !this.isSampledDataLoaded || this.isSampledDataLoading) {
      return;
    }
    let field = document.getElementsByClassName('designed-text-field')[0];

    /* fix it !!  set font
    ====================== */
    this.applyFont();

    let chars = document.getElementsByClassName(
      'designed-text-field-chars')[0].childNodes;
    let runningCount = 0;
    let apply_data = (element1, element2) => {
      return () => {
        return new Promise((resolve, reject) => {
          if (this.sampledData.length <= 0 ||
              element1.textContent == '' ||
              element2.textContent == '') { resolve(); }
          console.log('applying to', element1.textContent, 'and', element2.textContent);
          let nearest = { index: -1, distance_square: 10 };
          let firstDensity = this.densities[element1.textContent];
          let secondDensity = this.densities[element2.textContent];
          let search_nearest = (element, index) => {
            return () => {
              return new Promise((c_resolve, reject) => {
                let distanceSquare =
                  this.distance_square(parseFloat(firstDensity),
                                       parseFloat(secondDensity),
                                       element.first_density,
                                       element.second_density);
                if (index == 0 || distanceSquare < nearest.distance_square) {
                  nearest = { index: index, distance_square: distanceSquare }
                }
                c_resolve();
              });
            }
          }
          let promises = [];
          this.sampledData.forEach((element, index) => {
            promises.push(search_nearest(element, index));
          });
          promises.push(() => {
            console.log(firstDensity, secondDensity, this.sampledData[nearest.index]);
            element1.style.letterSpacing =
              `${ this.sampledData[nearest.index]['letter_space_rate'] }em`;
            runningCount++;
            resolve();
          });
          promises.reduce((prev, curr, index, array) => {
            return prev.then(curr);
          }, Promise.resolve());
        });
      }
    }
    let promises2 = [];
    chars.forEach((element, index, array) => {
      if (index+1 >= array.length) { return; }
      else　{
        promises2.push(apply_data(array[index], array[index+1]));
      }
    });
    promises2.push(() => {
      let interval = setInterval(() => {
        console.log('Wait for the end of auto kerning', runningCount, chars.length-1);
        if (runningCount == chars.length - 1) {
          clearInterval(interval);
          console.log('New Text are Kerned');
        }
      });
    });
    let interval = setInterval(() => {
      if (this.isFontSet) {
        clearInterval(interval);
        promises2.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      }

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
}

let applyingEditor = new ApplyingEditor();

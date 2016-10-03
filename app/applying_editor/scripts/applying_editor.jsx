// YourTypes applying_editor/scripts/applying_editor.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import fs from 'fs';
import request from 'request';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DesignedTextView from './view/designed_text_view.jsx';

import Util from '../../common/scripts/util.jsx';

const { remote } = require('electron');
const dialog = remote.dialog;

class ApplyingEditor {
  constructor() {
    this.isSampledDataLoaded = false;
    this.isSampledDataLoading = false;
    this.sampledData = undefined;
    this.densities = undefined;
    this.nearest = undefined;
    this.fontInfo = {};
    this.addUIEvents();
  }
  addUIEvents() {
    this.addNewTextInputEvent();
    this.addSampledDataJSONSelectEvent();
    this.addApplyingDataToNewTextEvent();
  }
  setDesignedText(text, callback) {
    document.getElementsByClassName('designed-text-field')[0].innerHTML = '';
    ReactDOM.render(
      <DesignedTextView text={ text }/>,
      document.getElementsByClassName('designed-text-field')[0],
      callback
    );
  }
  addNewTextInputEvent() {
    let _this = this;
    let textarea = document.getElementsByName('new-text-input')[0];
    textarea.addEventListener('change', (event) => {
      let text = event.srcElement.value;
      this.setDesignedText(text, () => {
        this.analyseNewText();
      });
    });
  }
  analyseNewText() {
    let chars = document.getElementsByClassName(
      'designed-text-field-chars')[0].childNodes;
    if (chars.length < 2) { return; }
    let promises = [];
    chars.forEach((element, index, array) => {
      promises.push(this.analyse_char(element, index));
    });
    promises.push(() => {
      console.log('densities: ', this.densities);
    });
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());
  }
  addAnalysingNewTextEvent() {
    let _this = this;
    let button = document.getElementsByName('analyse-new-text')[0];
    button.addEventListener('click', (event) => {
      let chars = document.getElementsByClassName(
        'designed-text-field-chars')[0].childNodes;
      if (chars.length < 2) { return; }
      let promises = [];
      chars.forEach((element, index, array) => {
        promises.push(this.analyse_char(element, index));
      });
      promises.push(() => {
        console.log('densities: ', this.densities);
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
  apply_data(element1, element2) {
    return () => {
      return new Promise((resolve, reject) => {
        if (this.sampledData.length <= 0 ||
            element1.textContent == '' ||
            element2.textContent == '') { resolve(); }
        let nearest = { index: -1, distance_square: 10 };
        let firstDensity = this.densities[element1.textContent];
        let secondDensity = this.densities[element2.textContent];
        let search_nearest = (element, index) => {
          return () => {
            return new Promise((resolve, reject) => {
              let distanceSquare =
                this.distance_square(parseFloat(firstDensity),
                                     parseFloat(secondDensity),
                                     element.first_density,
                                     element.second_density);
              if (index == 0 || distanceSquare < nearest.distance_square) {
                nearest = { index: index, distance_square: distanceSquare }
              }
              resolve();
            });
          }
        }
        let promises = [];
        this.sampledData.forEach((element, index) => {
          promises.push(search_nearest(element, index));
        });
        promises.push(() => {
          console.log(this.sampledData[nearest.index]);
          element1.style.letterSpacing =
            `${ this.sampledData[nearest.index]['letter_space_rate'] }em`;
          resolve();
        });
        promises.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      });
    }
  }
  distance_square(pointX, pointY, pivotX, pivotY) {
    let diffX = pivotX - pointX;
    let diffY = pivotY - pointY;
    return  diffX * diffX + diffY * diffY;
  }
  addApplyingDataToNewTextEvent() {
    let _this = this;
    this.densities = {};
    this.nearest = { index: 0, distance_square: 0 }
    let button = document.getElementsByName('apply-merged-json-to-new-text')[0];
    button.addEventListener('click', (event) => {
      let chars =　document.getElementsByClassName(
        'designed-text-field-chars')[0].childNodes;
      let promises = [];
      chars.forEach((element, index, array) => {
        if (index+1 >= array.length) { return;}
        else　{
          promises.push(this.apply_data(array[index], array[index+1]));
        }
      });
      promises.push(() => {

      });
      promises.reduce((prev, curr, index, array) => {
        return prev.then(curr);
      }, Promise.resolve());
    });
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
        let runningCount = 0;
        json.values.forEach((element, index) => {
          if (element.first_density > 0 && element.second_density > 0) {
            const item = {
              first_density: element.first_density,
              second_density: element.second_density,
              letter_space_rate: element.kerning_value/50.0
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
      this.loadSampledDataJSON();
    });
  }
}

let applyingEditor = new ApplyingEditor();

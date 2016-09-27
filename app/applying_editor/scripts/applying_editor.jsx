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
    this.mergedData = undefined;
    this.densities = undefined;
    this.addUIEvents();
  }
  addUIEvents() {
    this.addNewTextInputEvent();
    this.addMergedDataJSONSelectEvent();
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
      this.setDesignedText(text);
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
  apply_data(element1, element2, index) {
    if (this.mergedData == false) { return; }
    // element1.style.letterSpacing = this.densities[element1.innerText]
  }
  addApplyingDataToNewTextEvent() {
    let _this = this;
    this.densities = {};
    let button = document.getElementsByName('apply-merged-json-to-new-text')[0];
    button.addEventListener('click', (event) => {
      let chars =　document.getElementsByClassName(
        'designed-text-field-chars')[0].childNodes;
      let promises = [];
      chars.forEach((element, index) => {
        promises.push(this.analyse_char(element, index));
      });
      chars.forEach((element, index, array) => {

      });
      promises.push(() => {
        console.log(this.densities);
      });
      promises.reduce((prev, curr, index, array) => {
        return prev.then(curr);
      }, Promise.resolve());
    });
  }
  addMergedDataJSONSelectEvent() {
    let _this = this;
    let button = document.getElementsByName('merged-data-json-selector')[0];
    button.addEventListener('click', (event) => {
      this.mergedData = {};
      let focusedWindow = remote.getCurrentWindow();
      let options = {
        properties: [
          'openFile'
        ]
      };
      dialog.showOpenDialog(focusedWindow, options, (file) => {
        if (file == undefined) { return; }
        fs.readFile(file[0], 'utf8', (error, rawData) => {
          if (error) { return; }
          this.mergedData = [];
          let json = JSON.parse(rawData);
          json.values.forEach((element, index) => {
            const item = {
              first_density: element.first_density,
              second_density: element.second_density,
              letter_space_rate: element.kerning_value/50
            };
            this.mergedData.push(item);
          });
          console.log(this.mergedData);
        });
      });
    });
  }
}

let applyingEditor = new ApplyingEditor();

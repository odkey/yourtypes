// YourTypes database_creator/scripts/database_creator.js
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import fs from 'fs';
import request from 'request';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Util from '../../common/scripts/util.jsx';

const { remote } = require('electron');
const dialog = remote.dialog;
// const BrowserWindow = remote.require('browser-window');

class DatabaseCreator {
  constructor() {
    this.densities = undefined;
    this.sampledData = undefined;
    this.mergedData = undefined;
    this.addUIEvents();
  }
  addUIEvents() {
    this.addCharImageFolderSelectEvent();
    this.addSampledDataJSONSelectEvent();
    this.addExportMergedDataJSONEvent();
  }
  addCharImageFolderSelectEvent() {
    let button =
      document.getElementsByClassName('char-image-folder-selector')[0];
    button.addEventListener('click', (event) => {
      this.densities = {};
      let focusedWindow = remote.getCurrentWindow();
      let options = {
        properties: [
          'openDirectory'
        ]
      };
      dialog.showOpenDialog(focusedWindow, options, (folder) => {
        if (folder == undefined) { return; }
        console.log(folder[0]);
        fs.readdir(folder[0], (error, files) => {
          files.forEach((element, index) => {
            let canvas = document.createElement('canvas');
            if (!canvas || !canvas.getContext) {
              console.log('error: canvas is not found');
              return;
            }
            let image = new Image();
            let context = canvas.getContext('2d');
            image.src = `${ folder[0] }/${ element }`;
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
                this.densities[element.split('.png')[0]] = density;
                console.log(index, element, density, this.densities);
              });
              promises.reduce((prev, curr, index, array) => {
                return prev.then(curr);
              }, Promise.resolve());
            }
          });
        });
      });
    });
  }
  addSampledDataJSONSelectEvent() {
    let button =
      document.getElementsByClassName('sampled-data-json-selector')[0];
    button.addEventListener('click', (event) => {
      this.sampledData = {};
      let focusedWindow = remote.getCurrentWindow();
      let options = {
        properties: [
          'openFile'
        ]
      };
      dialog.showOpenDialog(focusedWindow, options, (file) => {
        if (file == undefined) { return; }
        console.log(file);
        fs.readFile(file[0], 'utf8', (error, rawData) => {
          if (error) { return; }
          this.sampledData = JSON.parse(rawData);
          console.log(this.sampledData);
        });
      });
    });
  }
  addExportMergedDataJSONEvent() {
    let button =
      document.getElementsByClassName('export-merged-data-json')[0];
    button.addEventListener('click', (event) => {
      if (!this.densities || !this.sampledData) {
        console.log('error', this.densities, this.sampledData);
        return;
      }
      let merge = (element, index) => {
        return () => {
          return new Promise((resolve, reject) => {
            let firstDensity = this.densities[element['first_char']];
            let secondDensity = this.densities[element['second_char']];
            element['first_density'] = firstDensity;
            element['second_density'] = secondDensity;
            console.log(element);
            resolve();
          });
        }
      }
      let promises = [];
      this.sampledData.values.forEach((element, index, array) => {
        promises.push(merge(element, index));
      });
      promises.push(() => {
        let blob = new Blob([JSON.stringify(this.sampledData)],
                            { type: 'application/json' });
        saveAs(blob, `${ this.sampledData.font.name }_merged_data.json`);
      });
      promises.reduce((prev, curr, index, array) => {
        return prev.then(curr);
      }, Promise.resolve());
    });
  }
}

let databaseCreator = new DatabaseCreator();

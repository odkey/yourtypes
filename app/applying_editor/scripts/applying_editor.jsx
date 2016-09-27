// YourTypes applying_editor/scripts/applying_editor.jsx
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

class ApplyingEditor {
  constructor() {
    this.mergedData = undefined;
    this.addUIEvents();
  }
  addUIEvents() {
    this.addMergedDataJSONSelectEvent();
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
          this.mergedData = JSON.parse(rawData);
          console.log(this.mergedData);
        });
      });
    });
  }
}

let applyingEditor = new ApplyingEditor();

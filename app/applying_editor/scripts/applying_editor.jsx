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
      console.log(text);
    });
  }
  addApplyingDataToNewTextEvent() {
    let _this = this;
    let button = document.getElementsByName('apply-merged-json-to-new-text')[0];
    button.addEventListener('click', (event) => {
      let newText = document.getElementsByName('new-text-input')[0].value;
      console.log(newText);
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
          this.mergedData = JSON.parse(rawData);
          console.log(this.mergedData);
        });
      });
    });
  }
}

let applyingEditor = new ApplyingEditor();

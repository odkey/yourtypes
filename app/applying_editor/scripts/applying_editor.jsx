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
    this.addUIEvents();
  }
  addUIEvents() {
    this.addSelectMergedDataJSONEvent();
  }
  addSelectMergedDataJSONEvent() {
    let _this = this;
    let button = document.getElementsByName('merged-data-json-selector')[0];
    button.addEventListener('click', (event) => {
      
    });
  }
}

let applyingEditor = new ApplyingEditor();

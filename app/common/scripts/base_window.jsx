// YourTypes common/scripts/base_window.js
// Coded by Yota Odaka

'use strict';

const { BrowserWindow, remote } = require('electron');

export default class BaseWindow {
  constructor(pathToHTML) {
    this.pathToHTML = pathToHTML;
    this.window = undefined;
    this.window = 800;
    this.window = 600;
  }
  run() {
    let options = { width: this.width, height: this.height };
    this.window = new BrowserWindow(options);
    this.window.loadURL(this.pathToHTML);
    this.window.on('closed', () => {
      this.window = undefined;
    });
  }
  setWindowSize(width, height) {
    this.width = width;
    this.height = height;
  }
}

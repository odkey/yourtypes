// YourTypes common/scripts/base_window.js
// Coded by Yota Odaka

'use strict';

const { BrowserWindow, remote } = require('electron');

export default class BaseWindow {
  constructor(pathToHTML) {
    this.pathToHTML = pathToHTML;
    this.window = undefined;
    this.width = 800;
    this.height = 600;
  }
  run() {
    let options = { width: this.width, height: this.height,
                    x: this.x, y: this.y };
    this.window = new BrowserWindow(options);
    this.window.loadURL(this.pathToHTML);
    this.window.on('closed', () => {
      this.window = undefined;
    });
  }
  setWindowSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.window != undefined) {
      this.window.setSize(this.width, this.height);
    }
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.window != undefined) {
      this.window.setPosition(this.x, this.y);
    }
  }
}

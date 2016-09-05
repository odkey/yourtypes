// YourTypes kerning_training_window.js
// Coded by Yota Odaka

'use strict';

const { BrowserWindow } = require('electron');

export class KerningTrainingWindow {
  constructor(pathToHTML) {
    this.pathToHTML = pathToHTML;
    this.window = undefined;
  }
  run() {
    let options = { width: 800, height: 600 };
    this.window = new BrowserWindow(options);
    this.window.loadURL(this.pathToHTML);
    this.window.on('closed', () => {
      this.window = undefined;
    });
  }

}

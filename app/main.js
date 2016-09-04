// YourTypes main.js
// Coded by Yota Odaka
'use strict';

require('babel-register');
const { app, BrowserWindow, crashReporter } = require('electron');


if (process.env.NODE_ENV === 'develop') {
  crashReporter.start();
}

let mainWindow = undefined;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
app.on('ready', () => {
  const options = { width: 800, height: 600 };
  mainWindow = new BrowserWindow(options);
  mainWindow.loadURL(`file://${ __dirname }/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
});

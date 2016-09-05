// YourTypes main.js
// Coded by Yota Odaka

'use strict';

require('babel-register');
require('babel-core');
const { app, Menu, MenuItem,
        BrowserWindow, crashReporter } = require('electron');

const { KerningTrainingWindow } = require('./kerning_training_window');

class AppManager {
  constructor() {
    this.menu = undefined;
    this.kerningTrainingWindow =
      new KerningTrainingWindow(`file://${ __dirname }/training.html`);
  }
  addApplicationMenu() {
    this.menu = Menu.getApplicationMenu();
    if (this.menu == false) {
      console.log('Application menu is not ready');
      return;
    }
    const additional = new MenuItem({
      label: 'Applications',
      submenu: [
        {
          label: 'Kerning Training',
          accelerator: 'CmdOrCtrl+T',
          click(item, focusedWindow) {
            this.runKerningTrainingWindow();
          }
        }
      ]
    });
    this.menu.insert(1, additional);
    Menu.setApplicationMenu(this.menu);
    console.log('Applications menu has been updated');
  }
  runKerningTrainingWindow() {
    this.kerningTrainingWindow.run();
  }

}
let appManager = new AppManager();

if (process.env.NODE_ENV === 'develop') {
  crashReporter.start();
}

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
app.on('ready', () => {
  appManager.addApplicationMenu();
  appManager.runKerningTrainingWindow();
});

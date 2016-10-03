// YourTypes main.js
// Coded by Yota Odaka

'use strict';

require('babel-register');
// require('babel-core');
const { app, Menu, MenuItem, BrowserWindow, crashReporter } =
  require('electron');
const { MainApplicationWindow } =
  require('./main_application/scripts/main_application_window');
const { ApplyingEditorWindow } =
  require('./applying_editor/scripts/applying_editor_window');
const { KerningTrainingWindow } =
  require('./kerning_training/scripts/kerning_training_window');
const { DatabaseCreatorWindow } =
  require('./database_creator/scripts/database_creator_window');

class AppManager {
  constructor() {
    this.menu = undefined;
    this.mainApplicationWindow = new MainApplicationWindow(
      `file://${ __dirname }/main_application/index.html`);
    this.applyingEditorWindow = new ApplyingEditorWindow(
      `file://${ __dirname }/applying_editor/index.html`);
    this.kerningTrainingWindow = new KerningTrainingWindow(
      `file://${ __dirname }/kerning_training/index.html`);
    this.databaseCreatorWindow = new DatabaseCreatorWindow(
      `file://${ __dirname }/database_creator/index.html`);
  }
  runMainApplicationWindow() {
    this.mainApplicationWindow.run();
  }
  runApplyingEditorWindow() {
    this.applyingEditorWindow.run();
  }
  runKerningTrainingWindow() {
    this.kerningTrainingWindow.run();
  }
  runDatabaseCreatorWindow() {
    this.databaseCreatorWindow.run();
  }
  addApplicationMenu() {
    let _this = this;
    this.menu = Menu.getApplicationMenu();
    if (this.menu == false) {
      console.log('Application menu is not ready');
      return;
    }
    const additional = new MenuItem({
      label: 'Applications',
      submenu: [
        {
          label: 'New App',
          accelerator: 'CmdOrCtrl+N',
          click(item, focusedWindow) {
            _this.runMainApplicationWindow();
          }
        },
        {
          label: 'Applying Editor',
          accelerator: 'CmdOrCtrl+Alt+A',
          click(item, focusedWindow) {
            _this.runApplyingEditorWindow();
          }
        },
        {
          label: 'Kerning Training',
          accelerator: 'CmdOrCtrl+Alt+T',
          click(item, focusedWindow) {
            _this.runKerningTrainingWindow();
          }
        },
        {
          label: 'Database Creator',
          accelerator: 'CmdOrCtrl+Alt+D',
          click(item, focusedWindow) {
            _this.runDatabaseCreatorWindow();
          }
        }
      ]
    });
    this.menu.insert(1, additional);
    Menu.setApplicationMenu(this.menu);
    console.log('Applications menu has been updated');
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
  // appManager.runMainApplicationWindow();
  appManager.runApplyingEditorWindow();
  // appManager.runKerningTrainingWindow();
  // appManager.runDatabaseCreatorWindow();
});

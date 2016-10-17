// YourTypes applying_editor/scripts/applying_editor_window.jsx
// Coded by Yota Odaka

'use strict';

import BaseWindow from '../../common/scripts/base_window.jsx';

export class ApplyingEditorWindow extends BaseWindow {
  constructor(pathToHTML) {
    super(pathToHTML);
  }
  sendExportCSVMessage() {
    this.window.webContents.send('export.csv.message', 'true');
  }
}

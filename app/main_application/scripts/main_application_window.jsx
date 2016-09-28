// YourTypes main_application_window/scripts/main_application_window.jsx
// Coded by Yota Odaka

'use strict';

import BaseWindow from '../../common/scripts/base_window.jsx';

export class MainApplicationWindow extends BaseWindow {
  constructor(pathToHTML) {
    super(pathToHTML);
    this.setWindowSize(1200, 800);
  }
}

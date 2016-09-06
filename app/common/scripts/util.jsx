// YourTypes common/scripts/util.jsx
// Coded by Yota Odaka

'use strict';

export default class Util {
  static toggleClass(element, className){
    if (!element || !className){ return; }
    let classString = element.className;
    const nameIndex = classString.indexOf(className);
    if (nameIndex == -1) {
      classString += ' ' + className;
    }
    else {
      classString =
        classString.substr(0, nameIndex) +
        classString.substr(nameIndex+className.length);
    }
    element.className = classString;
  }
}

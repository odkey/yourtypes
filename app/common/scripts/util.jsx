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
  static deleteElementWithClassName(className, index) {
    if (!(index >= 0)) { index = 0; }
    let element = document.getElementsByClassName(className)[index];
    if (!element) { return; }
    let parent = element.parentNode;
    parent.removeChild(element);
  }
  static deleteElementsWithClassName(className) {
    let elemnts = document.getElementsByClassName(className);
    if (!elements) { return; }
    let parent = elements[0].parentNode;
    elements.forEach((element) => {
      parent.removeChild(element);
    });
  }
}

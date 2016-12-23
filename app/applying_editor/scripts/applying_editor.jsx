// YourTypes applying_editor/scripts/applying_editor.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import fs from 'fs';
import request from 'request';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import fontManager from 'font-manager';
import DesignedTextView from './view/designed_text_view.jsx';
import FontSelectorView from '../../common/scripts/font_selector_view.jsx';

import Util from '../../common/scripts/util.jsx';

const { remote, ipcRenderer } = require('electron');
const dialog = remote.dialog;

class ApplyingEditor {
  constructor() {
    // Status booleans
    this.isFontSet = false;
    this.isTextSet = false;
    this.isTextSetting = false;
    this.isSampledDataLoaded = false;
    this.isSampledDataLoading = false;
    this.isDataApplied = false;
    this.isDataApplying = false;
    this.isTextAnalysed = false;
    this.isTextAnalysing = false;
    this.isTextKerned = false;
    this.isTextKerning = false;
    this.isImagesStoring = false;
    this.isImagesStored = false;

    this.analyseMode = 'default';
    this.applyingCountDefault = 0;
    this.applyingCountStrict = 0;
    this.applyingCountNormal = 0;
    this.applyingCountLite = 0;
    this.applyingCountBottomHalf = 0;
    this.applyingCountSideSpace = 0;

    this.sampledData = undefined;
    this.densities = undefined;
    this.nearest = undefined;
    this.fontInfo = new Object();
    this.images = new Array();

    this.initFontSelector(() => {
      this.addFontSelectEvent();
      this.isFontSet = false;
      this.applyFont();
    });
    this.addIPCEvents();
    this.addUIEvents();
    // To disable drag & drop event
    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      return false;
    }, false);
    document.addEventListener('drop', (event) => {
      event.preventDefault();
      return false;
    }, false);
    // To disallow any operation while some processes haven't finished
    this.curtain = document.getElementsByClassName('loading-curtain')[0];
    this.strictnessSelector =
      document.getElementsByName('applying-mode-selector-items')[0];
    let interval = setInterval(() => {
      if(this.is_operation_allowed()) {
        Util.addClass(this.curtain, 'hidden');
      }
      else {
        Util.removeClass(this.curtain, 'hidden');
      }
      if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
        this.enableNewTextInput();
      }
      else {
        this.disableNewTextInput();
      }
    }, 100);
  }
  addIPCEvents() {
    this.listenExportCSVMessage();
  }
  listenExportCSVMessage() {
    ipcRenderer.on('export.csv.message', (event, arg) => {
      if (this.isDataApplied) {

        const bhChars =
          document.getElementsByClassName('designed-text-field-chars bottom-half');
        const sChars =
          document.getElementsByClassName('designed-text-field-chars strict');
        const nChars =
          document.getElementsByClassName('designed-text-field-chars normal');
        const lChars =
          document.getElementsByClassName('designed-text-field-chars lite');
        const ssChars =
          document.getElementsByClassName('designed-text-field-chars side-space');
        let csvData = '';
        for (let i = 0; i < bhChars.length-1; i++) {
          csvData += bhChars[i].style.letterSpacing.split('em');
          if (i == bhChars.length-2) {
            csvData += '\n';
          }
          else {
            // csvData += '\t';
          }
        }
        for (let i = 0; i < sChars.length-1; i++) {
          csvData += sChars[i].style.letterSpacing.split('em');
          if (i == sChars.length-2) {
            csvData += '\n';
          }
          else {
            // csvData += '\t';
          }
        }
        for (let i = 1; i < nChars.length-1; i++) {
          csvData += nChars[i].style.letterSpacing.split('em');
          if (i == nChars.length-2) {
            csvData += '\n';
          }
          else {
            // csvData += '\t';
          }
        }
        for (let i = 1; i < lChars.length-1; i++) {
          csvData += lChars[i].style.letterSpacing.split('em');
          if (i == lChars.length-2) {
            csvData += '\n';
          }
          else {
            // csvData += '\t';
          }
        }
        for (let i = 1; i < ssChars.length-1; i++) {
          csvData += ssChars[i].style.letterSpacing.split('em');
          if (i == ssChars.length-2) {
            csvData += '\n';
          }
          else {
            // csvData += '\t';
          }
        }
        console.dir(csvData);
        let blob
          = new Blob([csvData], { type: 'text/plain;charset=utf-16' });
        saveAs(blob, 'result.csv');
      }
      else {
        console.warn('No data is applied to the text');

      }
    });
  }
  disableNewTextInput() {
    let textarea = document.getElementsByName('new-text-input')[0];
    if (textarea == undefined) { return; }
    textarea.disabled = true;
  }
  enableNewTextInput() {
    let textarea = document.getElementsByName('new-text-input')[0];
    if (textarea == undefined) { return; }
    textarea.disabled = false;
  }
  addUIEvents() {
    this.addNewTextInputEvent();
    this.addSampledDataJSONSelectEvent();
    this.addAllTextFieldToggleEvent();
    this.addAnalyseModeSelectorEvent();
  }
  addAnalyseModeSelectorEvent() {
    let selector = document.getElementsByName('analyse-mode-selector-items')[0];
    selector.addEventListener('change', (event) => {
      this.analyseMode = selector.options[selector.selectedIndex].value;
    });
  }
  addAllTextFieldToggleEvent() {
    this.addTextFieldToggleEvent('default');
    this.addTextFieldToggleEvent('strict');
    this.addTextFieldToggleEvent('normal');
    this.addTextFieldToggleEvent('lite');
    this.addTextFieldToggleEvent('bottom-half');
    this.addTextFieldToggleEvent('side-space');
  }
  addTextFieldToggleEvent(type) {
    if (type != 'default' && type != 'strict' && type != 'normal' &&
        type != 'lite' && type != 'bottom-half' && type != 'side-space') {
      console.error('Input type is not valid:', type);
      return;
    }
    let toggle =
      document.getElementsByName(`designed-text-field-toggle-${ type }`)[0];
    toggle.addEventListener('change', (event) => {
      let field = document.querySelector(`.designed-text-field.${ type }`);
      (event.srcElement.checked)?
        Util.removeClass(field, 'hidden'): Util.addClass(field, 'hidden');
    });
  }
  setAllTextFieldToggleOn() {
    let toggles = new Array();
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-default')[0]);
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-bottom-half')[0]);
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-strict')[0]);
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-normal')[0]);
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-lite')[0]);
    toggles.push(
      document.getElementsByName('designed-text-field-toggle-side-space')[0]);
    let event = document.createEvent('HTMLEvents');
    event.initEvent('change', false, true);
    toggles.forEach((element, index, array) => {
      element.checked = true;
      element.dispatchEvent(event);
    });
  }
  addFontSelectEvent() {
    let selector = document.getElementsByClassName('font-selector-items')[0];
    selector.addEventListener('change', (event) => {
      let selected = selector.options[selector.selectedIndex];
      let name = selected.dataset.postscriptname;
      let path = selected.dataset.path;
      this.setFontStyle(name, path);
    });
  }
  setFontSize(size) {
    let  fields = document.getElementsByClassName('designed-text-field');
    for (let i = 0; i < fields.length; i++) {
      console.log(fields[i].style.fontSize);
      fields[i].style.fontSize = `${ size }px`
    }
  }
  findFont(name) {
    let isExisted = false;
    let index = -1;
    const selector = document.getElementsByClassName('font-selector-items')[0];
    if (selector == undefined || selector.options.length == 0) { return; }
    const options = selector.options;
    for (let i = 0; i < options.length; i++) {
      const valid = (options[i].dataset.postscriptname == name);
      if (valid) {
        index = i;
        isExisted = true;
      }
    }
    return { isExisted: isExisted, index: index };
  }
  applyFont(name) {
    const selector = document.getElementsByClassName('font-selector-items')[0];
    let fontname = '';
    let fontpath = '';
    if (name == undefined) {
      let selected = selector.options[selector.selectedIndex];
      fontname = selected.dataset.postscriptname;
      fontpath = selected.dataset.path;
    }
    else {
      let result = this.findFont(name);
      if (result.isExisted) {
        selector.options[result.index].selected = true;
        let selected = selector.options[result.index];
        fontname = selected.dataset.postscriptname;
        fontpath = selected.dataset.path;
      }
      else {
        console.log(`font ${ name } not exists`);
        return;
      }
    }
    this.setFontStyle(fontname, fontpath);
  }
  setFontStyle(name, path) {
    this.isFontSet = false;
    let className = 'additional-font-face-style-tag';
    Util.deleteElementWithClassName(className);
    let style = document.createElement('style');
    style.className = className;
    style.appendChild(document.createTextNode(
      `@font-face {
         font-family: ${ name };
         src: url(${ path });
       }`));
    document.head.appendChild(style);
    let fields =
      document.getElementsByClassName('designed-text-field-chars');
    let interval = setInterval(() => {
      if (fields != undefined) {
        clearInterval(interval);
        for (let i = 0; i < fields.length; i++) {
          fields[i].style.fontFamily = name;
        }
        this.isFontSet = true;
      }
    }, 100);
  }
  setDesignedText(text, callback) {
    document.getElementsByClassName(
      'designed-text-field default')[0].innerHTML = '';
    document.getElementsByClassName(
      'designed-text-field bottom-half')[0].innerHTML = '';
    document.getElementsByClassName(
      'designed-text-field strict')[0].innerHTML = '';
    document.getElementsByClassName(
      'designed-text-field normal')[0].innerHTML = '';
    document.getElementsByClassName(
      'designed-text-field lite')[0].innerHTML = '';
    document.getElementsByClassName(
      'designed-text-field side-space')[0].innerHTML = '';
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'default' }/>,
      document.getElementsByClassName('designed-text-field default')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'bottom-half' }/>,
      document.getElementsByClassName('designed-text-field bottom-half')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'strict' }/>,
      document.getElementsByClassName('designed-text-field strict')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'normal' }/>,
      document.getElementsByClassName('designed-text-field normal')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'lite' }/>,
      document.getElementsByClassName('designed-text-field lite')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
    ReactDOM.render(
      <DesignedTextView text={ text } additionalClass={ 'side-space' }/>,
      document.getElementsByClassName('designed-text-field side-space')[0],
      () => {
        if (callback) { callback(); }
        this.isTextSet = true;
        this.isTextSetting = false;
      }
    );
  }
  addNewTextInputEvent() {
    let textarea = document.getElementsByName('new-text-input')[0];
    textarea.addEventListener('change', (event) => {
      this.setAllTextFieldToggleOn();
      let text = event.srcElement.value;
      if (text.length < 1 || text == ' ') { return; }
      this.isTextSet = false;
      this.isTextSetting = true;
      this.isFontSet = false;
      this.setDesignedText(text, () => { this.applyFont(); });
      if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
        this.isImagesStored = false;
        this.isImagesStoring = true;
        this.isTextAnalysed = false;
        this.isTextAnalysing = true;
        this.isDataApplied = false;
        this.isDataApplying = true;
        let interval = setInterval(() => {
          if (this.isTextSet && !this.isTextSetting && this.isFontSet) {
            clearInterval(interval);
            console.log('Store char images');
            this.storeCharImages();
            let interval2 = setInterval(() => {
              if (this.isImagesStored && !this.isImagesStoring) {
                clearInterval(interval2);
                console.log('Analyse chars stored into images');
                this.analyseCharImages();
                let interval3 = setInterval(() => {
                  if (this.isTextAnalysed && !this.isTextAnalysing) {
                    clearInterval(interval3);
                    console.log('Apply letter space data');
                    this.applyLetterSpaces();
                  }
                }, 100);
              }
            }, 100);
          }
        }, 100);
      }
    });
  }
  applyLetterSpaces() {
    this.isDataApplied = false;
    this.isDataApplying = true;
    this.applyingCountDefault = 0;
    this.applyingCountBottomHalf = 0;
    this.applyingCountStrict = 0;
    this.applyingCountNormal = 0;
    this.applyingCountLite = 0;
    this.applyingCountSideSpace = 0;
    let defaultChars = document.getElementsByClassName(
      'designed-text-field-chars default')[0].childNodes;
    let bottomHalfChars = document.getElementsByClassName(
      'designed-text-field-chars bottom-half')[0].childNodes;
    let strictChars = document.getElementsByClassName(
      'designed-text-field-chars strict')[0].childNodes;
    let normalChars = document.getElementsByClassName(
      'designed-text-field-chars normal')[0].childNodes;
    let liteChars = document.getElementsByClassName(
      'designed-text-field-chars lite')[0].childNodes;
    let sideSpaceChars = document.getElementsByClassName(
      'designed-text-field-chars side-space')[0].childNodes;
    defaultChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      element.style.letterSpacing = '0em';
      this.applyingCountDefault++;
    });
    liteChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      this.applyLetterSpacesLite(element, index, array);
    });
    normalChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      this.applyLetterSpacesNormal(element, index, array);
    });
    strictChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      this.applyLetterSpacesStrict(element, index, array);
    });
    bottomHalfChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      this.applyLetterSpacesBottomHalf(element, index, array);
    });
    sideSpaceChars.forEach((element, index, array) => {
      if (index == array.length - 1) { return; }
      this.applyLetterSpacesSideSpace(element, index, array);
    });
    // To wait for the end of applying
    let interval = setInterval(() => {
      if (this.applyingCountDefault == defaultChars.length-1 &&
          this.applyingCountBottomHalf == bottomHalfChars.length-1 &&
          this.applyingCountStrict == strictChars.length-1 &&
          this.applyingCountNormal == normalChars.length-1 &&
          this.applyingCountLite == liteChars.length-1 &&
          this.applyingCountSideSpace == sideSpaceChars.length-1) {
        clearInterval(interval);
        this.isDataApplied = true;
        this.isDataApplying = false;
        console.log('Letter space data is applied.');
      }
    }, 100);
  }
  applyLetterSpacesSideSpace(element, index, array) {
    // Implement!!!!!
  }

  applyLetterSpacesLite(element, index, array) {
    this.applyingCountLite = 0;
    let nearest = { squaredDistance: 1000, index: -1 };
    let firstDensity =
      parseFloat(this.densities[array[index].textContent].all);
    let secondDensity =
      parseFloat(this.densities[array[index+1].textContent].all);
    let searchCount = 0;
    this.sampledData.forEach((element, index, array) => {
      let sampleFirstDenstiy = parseFloat(element.first_char.densities.all);
      let sampleSecondDensity = parseFloat(element.second_char.densities.all);
      let diffFirst = firstDensity - sampleFirstDenstiy;
      let diffSecond = secondDensity - sampleSecondDensity;
      let squaredDistance = diffFirst * diffFirst + diffSecond * diffSecond;
      if (this.analyseMode == 'except-origin') {
        if (squaredDistance > 0 && squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance};
        }
      }
      else {
        if (squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance };
        }
      }
      searchCount++;
    });
    let interval = setInterval(() => {
      if (searchCount == this.sampledData.length) {
        clearInterval(interval);
        element.style.letterSpacing =
          `${ this.sampledData[nearest.index].letter_space.em }em`;
        this.applyingCountLite++;
      }
    }, 100);
  }
  applyLetterSpacesNormal(element, index, array) {
    this.applyingCountNormal = 0;
    let nearest = { squaredDistance: 1000, index: -1 };
    let firstDensity =
      parseFloat(this.densities[array[index].textContent].right);
    let secondDensity =
      parseFloat(this.densities[array[index+1].textContent].left);
    let searchCount = 0;
    this.sampledData.forEach((element, index, array) => {
      let sampleFirstDenstiy = parseFloat(element.first_char.densities.right);
      let sampleSecondDensity = parseFloat(element.second_char.densities.left);
      let diffFirst = firstDensity - sampleFirstDenstiy;
      let diffSecond = secondDensity - sampleSecondDensity;
      let squaredDistance = diffFirst * diffFirst + diffSecond * diffSecond;
      if (this.analyseMode == 'except-origin') {
        if (squaredDistance > 0 && squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance};
        }
      }
      else {
        if (squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance };
        }
      }
      searchCount++;
    });
    let interval = setInterval(() => {
      if (searchCount == this.sampledData.length) {
        clearInterval(interval);
        element.style.letterSpacing =
          `${ this.sampledData[nearest.index].letter_space.em }em`;
        this.applyingCountNormal++;
      }
    }, 100);
  }
  applyLetterSpacesStrict(element, index, array) {
    this.applyingCountStrict = 0;
    let nearest = { squaredDistance: 1000, index: -1 };
    let firstTopDensity =
      parseFloat(this.densities[array[index].textContent].right_top);
    let firstBottomDensity =
      parseFloat(this.densities[array[index].textContent].right_bottom);
    let secondTopDensity =
      parseFloat(this.densities[array[index+1].textContent].left_top);
    let secondBottomDensity =
      parseFloat(this.densities[array[index+1].textContent].left_bottom);
    let searchCount = 0;
    this.sampledData.forEach((element, index, array) => {
      let sampleFirstTopDenstiy =
        parseFloat(element.first_char.densities.right_top);
      let sampleFirstBottomDenstiy =
        parseFloat(element.first_char.densities.right_bottom);
      let sampleSecondTopDensity =
        parseFloat(element.second_char.densities.left_top);
      let sampleSecondBottomDensity =
        parseFloat(element.second_char.densities.left_bottom);
      let diff1 = firstTopDensity - sampleFirstTopDenstiy;
      let diff2 = firstBottomDensity - sampleFirstBottomDenstiy;
      let diff3 = secondTopDensity - sampleSecondTopDensity;
      let diff4 = secondBottomDensity - sampleSecondBottomDensity;
      let squaredDistance =
        diff1 * diff1 + diff2 * diff2 + diff3 * diff3 + diff4 * diff4;
        if (this.analyseMode == 'except-origin') {
          if (squaredDistance > 0 && squaredDistance < nearest.squaredDistance) {
            nearest = { index: index, squaredDistance: squaredDistance};
          }
        }
        else {
          if (squaredDistance < nearest.squaredDistance) {
            nearest = { index: index, squaredDistance: squaredDistance };
          }
        }
      searchCount++;
    });
    let interval = setInterval(() => {
      if (searchCount == this.sampledData.length) {
        clearInterval(interval);
        element.style.letterSpacing =
          `${ this.sampledData[nearest.index].letter_space.em }em`;
        this.applyingCountStrict++;
      }
    }, 100);
  }
  applyLetterSpacesBottomHalf(element, index, array) {
    this.applyingCountBottomHalf = 0;
    let nearest = { squaredDistance: 1000, index: -1 };
    let firstDensity =
      parseFloat(this.densities[array[index].textContent].right_bottom/2.0) +
        parseFloat(this.densities[array[index].textContent].left_bottom/2.0);
    let secondDensity =
      parseFloat(this.densities[array[index+1].textContent].left_bottom/2.0) +
        parseFloat(this.densities[array[index+1].textContent].right_bottom/2.0);
    let searchCount = 0;
    this.sampledData.forEach((element, index, array) => {
      let sampleFirstDenstiy =
        parseFloat(element.first_char.densities.left_bottom/2.0) +
          parseFloat(element.first_char.densities.right_bottom/2.0);
      let sampleSecondDensity =
        parseFloat(element.second_char.densities.left_bottom/2.0) +
          parseFloat(element.second_char.densities.left_bottom/2.0);
      let diffFirst = firstDensity - sampleFirstDenstiy;
      let diffSecond = secondDensity - sampleSecondDensity;
      let squaredDistance = diffFirst * diffFirst + diffSecond * diffSecond;
      if (this.analyseMode == 'except-origin') {
        if (squaredDistance > 0 && squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance};
        }
      }
      else {
        if (squaredDistance < nearest.squaredDistance) {
          nearest = { index: index, squaredDistance: squaredDistance };
        }
      }
      searchCount++;
    });
    let interval = setInterval(() => {
      if (searchCount == this.sampledData.length) {
        clearInterval(interval);
        element.style.letterSpacing =
          `${ this.sampledData[nearest.index].letter_space.em }em`;
        this.applyingCountBottomHalf++;
      }
    }, 100);
  }
  analyseCharImages() {
    if (!this.isImagesStored) { return; }
    this.isTextAnalysed = false;
    this.isTextAnalysing = true;
    this.densities = new Object();
    let analysingCount = 0;
    this.images.forEach((element, index, array) => {
      let canvas = document.createElement('canvas');
      if (!canvas || !canvas.getContext) {
        console.log('error: illegal canvas');
        return;
      }
      let image = new Image();
      let context = canvas.getContext('2d');
      image.src = `${ element.img.src }`;
      image.onload = () => {
        context.drawImage(image, 0, 0);
        const imageData =
          context.getImageData(0, 0, image.width, image.height);
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const area = width * height;
        const halfArea = area / 2.0;
        const quarterArea = area / 4.0;
        let sumBlack = 0;
        let sumBlackLeft = 0;
        let sumBlackRight = 0;
        let sumBlackLeftTop = 0;
        let sumBlackLeftBottom = 0;
        let sumBlackRightTop = 0;
        let sumBlackRightBottom = 0;
        let sum_up = (element, index, kind) => {
          return () => {
            return new Promise((resolve, reject) => {
              if (kind == 'normal' || kind == 'all' || kind == undefined) {
                sumBlack += element/255.0;
              }
              else if (kind == 'left') {
                sumBlackLeft += element/255.0;
              }
              else if (kind == 'right') {
                sumBlackRight += element/255.0;
              }
              else if (kind == 'left-top') {
                sumBlackLeftTop += element/255.0
              }
              else if (kind == 'left-bottom') {
                sumBlackLeftBottom += element/255.0;
              }
              else if (kind == 'right-top') {
                sumBlackRightTop += element/255.0;
              }
              else if (kind == 'right-bottom') {
                sumBlackRightBottom += element/255.0;
              }
              else { console.error();('Illegal kind arg is set'); }
              resolve();
            });
          }
        }
        let density = 0;
        let promises = new Array();
        pixels.forEach((element, index) => {
          if (index%4 != 3) { return; }
          const i = parseFloat(parseInt(index/4));
          const x = i%parseFloat(width);
          const y = i/parseFloat(width);
          if (x < width/2) {
            if (y < height/2) {
              promises.push(sum_up(element, index, 'left-top'));
            }
            else {
              promises.push(sum_up(element, index, 'left-bottom'));
            }
          }
          else if (x >= width/2) {
            if (y < height/2) {
              promises.push(sum_up(element, index, 'right-top'));
            }
            else {
              promises.push(sum_up(element, index, 'right-bottom'));
            }
          }
        });
        promises.push(() => {
          const letter = element.char;
          const leftTopDensity = sumBlackLeftTop / quarterArea;
          const leftBottomDensity = sumBlackLeftBottom / quarterArea;
          const rightTopDensity = sumBlackRightTop / quarterArea;
          const rightBottomDensity = sumBlackRightBottom / quarterArea;
          const leftDensity = (leftTopDensity + leftBottomDensity) / 2.0;
          const rightDensity = (rightTopDensity + rightBottomDensity) / 2.0;
          const density = (leftDensity + rightDensity) / 2.0;
          this.densities[letter] = new Object();
          this.densities[letter]['left_top'] = leftTopDensity;
          this.densities[letter]['left_bottom'] = leftBottomDensity;
          this.densities[letter]['right_top'] = rightTopDensity;
          this.densities[letter]['right_bottom'] = rightBottomDensity;
          this.densities[letter]['left'] = leftDensity;
          this.densities[letter]['right'] = rightDensity;
          this.densities[letter]['all'] = density;
          analysingCount++;
          if (analysingCount == this.images.length) {
            this.isTextAnalysed = true;
            this.isTextAnalysing = false;
            console.log('New text is analysed', this.densities);
          }
        });
        promises.reduce((prev, curr, index, array) => {
          return prev.then(curr);
        }, Promise.resolve());
      }
    });
  }
  storeCharImages() {
    this.isImagesStored = false;
    this.isImagesStoring = true;
    this.images = new Array();
    const container =
      document.getElementsByClassName('designed-text-field-chars')[0];
    console.log(container);
    let chars = container.childNodes;
    let runningCount = 0;
    let store_char = (element, index, array) => {
      return () => {
        return new Promise((resolve, reject) => {
          html2canvas(element, {
            onrendered: (canvas) => {
              let image = new Image();
              image.src = canvas.toDataURL();
              let object = {
                img: image,
                char: element.textContent
              };
              this.images.push(object);
              runningCount++;
              resolve();
            }
          });
        });
      }
    }
    let promises = new Array();
    let countOffset = 0;
    chars.forEach((element, index, array) => {
      promises.push(store_char(element, index, array));
    });
    promises.push(() => {
      let interval = setInterval(() => {
        if (runningCount == chars.length) {
          clearInterval(interval);
          this.isImagesStored = true;
          this.isImagesStoring = false;
          console.log('All chars are stored', this.images);
        }
      }, 100);
    });
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());
  }
  distance_square(pointX, pointY, pivotX, pivotY) {
    let diffX = pivotX - pointX;
    let diffY = pivotY - pointY;
    return  diffX * diffX + diffY * diffY;
  }
  loadSampledDataJSON() {
    this.sampledData = new Object();
    let focusedWindow = remote.getCurrentWindow();
    let options = {
      properties: [
        'openFile'
      ]
    };
    dialog.showOpenDialog(focusedWindow, options, (file) => {
      // Error handling
      if (file == undefined ||
          file[0].indexOf('.json') != file[0].length-5) {
        this.isTextSetting = false;
        this.isSampledDataLoading = false;
        this.isDataApplying = false;
        this.isTextAnalysing = false;
        this.isTextKerning = false;
        this.isImagesStoring = false;
        return;
      }
      fs.readFile(file[0], 'utf8', (error, rawData) => {
        if (error) { return; }
        this.isSampledDataLoaded = false;
        this.isSampledDataLoading = true;
        this.sampledData = [];
        let json = JSON.parse(rawData);
        this.fontInfo = {
          size: json.info.size,
          path: json.info.path,
          style: json.info.style,
          family: json.info.family,
          weight: json.info.weight,
          italic: json.info.italic,
          monospace: json.info.monospace,
          postscriptName: json.info.postscript_name
        };
        this.setFontSize(this.fontInfo.size);
        this.applyFont(this.fontInfo.postscriptName);
        let runningCount = 0;
        json.values.forEach((element, index) => {
          const item = {
            first_char: {
              densities: {
                all: element.first_char.densities.all,
                left: element.first_char.densities.left,
                left_bottom: element.first_char.densities.left_bottom,
                left_top: element.first_char.densities.left_top,
                right: element.first_char.densities.right,
                right_bottom: element.first_char.densities.right_bottom,
                right_top: element.first_char.densities.right_top,
              },
              letter: element.first_char.letter
            },
            second_char: {
              densities: {
                all: element.second_char.densities.all,
                left: element.second_char.densities.left,
                left_bottom: element.second_char.densities.left_bottom,
                left_top: element.second_char.densities.left_top,
                right: element.second_char.densities.right,
                right_bottom: element.second_char.densities.right_bottom,
                right_top: element.second_char.densities.right_top,
              },
              letter: element.second_char.letter
            },
            letter_space: {
              em: element.letter_space.em,
              px: element.letter_space.px
            }
          };
          this.sampledData.push(item);
          runningCount++;
        });
        let interval = setInterval(() => {
          if (runningCount == json.values.length) {
            document.getElementsByClassName(
              'sampled-data-json-name-value')[0].textContent =
                file[0].split('/')[file[0].split('/').length-1];
            this.isSampledDataLoaded = true;
            this.isSampledDataLoading = false;
            console.log('JSON loaded', this.sampledData);
            clearInterval(interval);
          }
        }, 100);
      });
    });
  }
  addSampledDataJSONSelectEvent() {
    let button = document.getElementsByName('sampled-data-json-selector')[0];
    button.addEventListener('click', (event) => {
      this.isSampledDataLoaded = false;
      this.isSampledDataLoading = true;
      this.loadSampledDataJSON();
      let interval = setInterval(() => {
        if (this.isSampledDataLoaded && !this.isSampledDataLoading) {
          clearInterval(interval);
          if (this.isTextSet && !this.isTextSetting) {
            let event = document.createEvent('HTMLEvents');
            event.initEvent('change', false, true);
            document.getElementsByName(
              'new-text-input')[0].dispatchEvent(event);
            console.log('New text input event is fired');
          }
        }
      }, 100);
    });
  }
  initFontSelector(callback) {
    fontManager.getAvailableFonts((fonts) => {
      let fonts_sort_condition = (font1, font2) => {
        if (font1.postscriptName < font2.postscriptName) { return -1; }
        if (font1.postscriptName > font2.postscriptName) { return 1; }
        return 0;
      }
      ReactDOM.render(
        <FontSelectorView fonts={ fonts.sort(fonts_sort_condition) } />,
        document.getElementsByClassName('font-selector')[0],
        callback
      );
    });
  }
  is_operation_allowed() {
    return !this.isTextSetting && !this.isSampledDataLoading &&
           !this.isDataApplying && !this.isTextAnalysing &&
           !this.isTextKerning && !this.isImagesStoring;
  }
}

let applyingEditor = new ApplyingEditor();

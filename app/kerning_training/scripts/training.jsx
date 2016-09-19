// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

require('babel-polyfill');
import request from 'request';
import JSZip from 'jszip';
import FileServer from 'file-server';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';

import Util from '../../common/scripts/util.jsx';
class Training {
  constructor() {
    this.settings = {
      isEmBoxShown: false,
      isBoundingBoxShown: false
    }
    this.text =
      'ある日の事でございます。';//御釈迦様おしゃかさまは極楽の蓮池はすいけのふちを、独りでぶらぶら御歩きになっていらっしゃいました。池の中に咲いている蓮はすの花は、みんな玉のようにまっ白で、そのまん中にある金色きんいろの蕊ずいからは、何とも云えない好よい匂においが、絶間たえまなくあたりへ溢あふれて居ります。極楽は丁度朝なのでございましょう。';
    this.setTrainingText(this.text, () => {
      this.enableCharsToBeDragged();
      this.prepareEmBoxRect();
    });
    this.addUIEvents();
  }
  addUIEvents() {
    this.addEmBoxEvent();
    this.addBoundingBoxEvent();
    this.addExportCharImagesEvent();
  }
  addEmBoxEvent() {
    let _this = this;
    let check = document.getElementsByName('field-setting-em-box')[0];
    check.addEventListener('change', (event) => {
      _this.settings.isEmBoxShown = event.target.checked;
      Util.toggleClass(
        document.getElementsByClassName('kerning-training-field-chars')[0],
        'hide-em-boxes');
      if (_this.settings.isEmBoxShown) {

      }
      else {

      }
    });
  }
  addBoundingBoxEvent() {
    let _this = this;
    let check = document.getElementsByName('field-setting-bounding-box')[0];
    check.addEventListener('change', (event) => {
      _this.settings.isBoundingBoxShown = event.target.checked;
      Util.toggleClass(document.getElementsByClassName('kerning-training-field-chars')[0],
      'hide-bounding-boxes');
      if (_this.settings.isBoundingBoxShown) {

      }
      else {

      }
    });
  }
  addExportCharImagesEvent() {
    let _this = this;
    let button = document.getElementsByClassName('export-char-images')[0];
    button.addEventListener('click', (event) => {
      this.saveCharsAsImages();
    });
  }
  setTrainingText(testText, callback) {
    ReactDOM.render(
      <TrainingSampleTextView text={testText} />,
      document.getElementsByClassName('kerning-training-field')[0],
      callback
    );
  }
  enableCharsToBeDragged() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    chars.forEach((element, index, array) => {
      if (index == 0) { return; }
      element.dragging = false;
      // Make drag events to each span elements
      element.addEventListener('mousedown', () => {
        element.dragging = true;
        element.pivot = element.clientX;
      });
      element.addEventListener('mouseup', () => {
        element.dragging = false;
        element.pivot = undefined;
      });
      element.addEventListener('mouseout', () => {
        element.dragging = false;
        element.pivot = undefined;
      });
      element.addEventListener('mousemove',(event) => {
        if (element.dragging) {
          const previous = array[index-1];
          let letterSpace = parseInt(previous.style.letterSpacing, 10);
            letterSpace += (event.clientX - element.pivot);
          previous.style.letterSpacing = letterSpace + 'px';
          element.pivot = event.clientX;
        }
      });
    });
  }
  prepareEmBoxRect() {
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    chars.forEach((element, index, array) => {
      element.emBoxGeo = {
        width: element.getClientRects()[0].width,
        height: element.getClientRects()[0].height
      }
    });
  }
  saveCharsAsSimpleImages() {
    // const folder =
  }
  saveCharsAsImages() {
    let zip = new JSZip();
    const folder =
      document.getElementsByClassName('font-selector-items')[0].value;
    const container =
      document.getElementsByClassName('kerning-training-field-chars')[0];
    let chars = container.childNodes;
    let convert = (element, index) => {
      return () => {
        return new Promise((resolve, reject) => {
          html2canvas(element, {
            onrendered: (canvas) => {
              // console.log(index, 'start');
              let savable = new Image();
              savable.src = canvas.toDataURL();
              let options = {
                base64: true,
                binary: true,
                compression: JSZip.DEFLATE,
                compressionOptions: { level: 9 }
              };
              zip.file(`${ element.innerText }.png`,
                       savable.src.split(',')[1],
                       options);
              console.log(index, 'end');
              resolve();
            }
          });
        });
      };
    };
    let promises = [];
    chars.forEach((element, index, array) => {
      promises.push(convert(element, index));
    });
    promises.push(()=>{
      zip.generateAsync({ type: 'blob' })
        .then((blob) => {
          saveAs(blob, `${ folder }.zip`);
        });
    });
    promises.reduce((prev, curr, index, array) => {
      return prev.then(curr);
    }, Promise.resolve());

    /*
    chars.forEach((element, index, array) => {
      // console.log(element, index, array);
      html2canvas(element, {
        onrendered: (canvas) => {
          let savable = new Image();
          savable.src = canvas.toDataURL();
          let options = {
            base64: true,
            binary: true,
            compression: JSZip.DEFLATE,
            compressionOptions: { level: 1 }
          };
          let a = zip.file(`${ element.innerText }.png`,
                   savable.src.split(',')[1],
                   options);
        }
      });
    });
    zip.generateAsync({ type: 'blob' })
      .then((blob) => {
        saveAs(blob, `${ folder }.zip`);
      });

    */

    // const convert = (element, index, array) => {
    //   return new Promise((resolve, reject) => {
    //     html2canvas(element, {
    //       onrendered: (canvas) => {
    //         let data = canvas.toDataURL();
    //         let img = document.createElement('img');
    //         img.src = data;
    //         zip.file(`${ element.innerText }.png`, canvas, true);
    //         console.log(zip);
    //         // resolve(element);
    //       }
    //     });
    //     setTimeout(resolve(index), 500);
    //   });
    // }
    // let promises = [];
    // chars.forEach((element, index, array) => {
    //   promises.push(convert(element, index, array));
    //   console.log('push', promises);
    // });
    // promises.reduce((prev, curr, index, array) => {
    //   return prev.then(curr);
    // }, Promise.resolve());

    // Promise.all(promises)
    //   .then((results) => {
    //     console.log('results', results);
    //   });
    // createZip().then(() => {
    //   console.log('zip', zip);
    //   // let a = document.createElement('a');
    //   // a.setAttribute('download', `${ folder }/${ element.innerText }.png`);
    //   // a.setAttribute('href', data);
    //   // a.click();
    // });
  }
}

let training = new Training();

// YourTypes kerning_training/scripts/training.jsx
// Coded by Yota Odaka

'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TrainingSampleTextView from './view/training_sample_text_view.jsx';

class Training {
  constructor() {
    // window.addEventListener('load', this.setTrainingText);
    this.text =
      'ある日の事でございます。御釈迦様おしゃかさまは極楽の蓮池はすいけのふちを、独りでぶらぶら御歩きになっていらっしゃいました。池の中に咲いている蓮はすの花は、みんな玉のようにまっ白で、そのまん中にある金色きんいろの蕊ずいからは、何とも云えない好よい匂においが、絶間たえまなくあたりへ溢あふれて居ります。極楽は丁度朝なのでございましょう。';

    this.setTrainingText(this.text);
    // window.onload = this.setTrainingText;
  }
  setTrainingText(testText) {
    ReactDOM.render(
      <TrainingSampleTextView text={testText} />,
      document.getElementsByClassName('kerning-training-field')[0]
    );
  }
}

let training = new Training();

// YourTypes kerning_training/scripts/view/training_sample_text_view.jsx
// Coded by Yota Odaka

'use strict';

import React from 'react';

export default class TrainingSampleTextView extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text
    }
  }
  render() {
    let chars = [];
    for (let i = 0; i < this.props.text.length; i++) {
      chars.push(<span key={ i }>{ this.props.text[i] }</span>);
    }
    console.log(chars);
    return (
      <div>
      { chars }
      </div>
    );
  }
  prepareTestWords(wordsLength) {
    this.state = 'ある日の事でございます。御釈迦様おしゃかさまは極楽の蓮池はすいけのふちを、独りでぶらぶら御歩きになっていらっしゃいました。池の中に咲いている蓮はすの花は、みんな玉のようにまっ白で、そのまん中にある金色きんいろの蕊ずいからは、何とも云えない好よい匂においが、絶間たえまなくあたりへ溢あふれて居ります。極楽は丁度朝なのでございましょう。';
  }
}

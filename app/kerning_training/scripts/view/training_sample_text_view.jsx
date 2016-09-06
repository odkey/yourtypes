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
    const className = 'kerning-training-field-chars hide-em-boxes hide-bounding-boxes';
    const style = {
      letterSpacing: '0px'
    };
    let chars = [];
    for (let i = 0; i < this.props.text.length; i++) {
      chars.push(<span key={ i } style={ style }>{ this.props.text[i] }</span>);
    }
    return (
      <div className={ className }>
      { chars }
      </div>
    );
  }
}

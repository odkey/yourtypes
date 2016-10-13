// YourTypes applying_editor/scripts/view/designed_text_view.jsx
// Coded by Yota Odaka

'use strict';

import React from 'react';

export default class DesignedTextView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      additionalClass: this.props.additionalClass
    };
  }
  render() {
    const className =
      `designed-text-field-chars ${ this.props.additionalClass }`;
    const style = {
      letterSpacing: '0em'
    };
    let chars = [];
    for (let i = 0; i < this.props.text.length; i++) {
      chars.push(<span key={ i } style={ style } className={ className }>{ this.props.text[i] }</span>);
    }
    return (
      <div className={ className }>
      { chars }
      </div>
    );
  }
}

// YourTypes kerning_training/scripts/view/font_selector_view.jsx
// Coded by Yota Odaka

'use strict';

import React from 'react';

export default class FontSelectorView extends React.Component {
  constructor(props) {
    super(props);
    this.fonts = props.fonts;
  }
  render() {
    const className = '';
    let options = [];
    this.fonts.forEach((element, index, array) => {
      options.push(
        <option key={ index }
                data-path={ element.path }
                data-style={ element.style }
                data-family={ element.family }
                data-weight={ element.weight }
                data-italic={ element.italic }
                data-monospace={ element.monospace }
                data-postscriptname={ element.postscriptName }>
          { element.postscriptName }
        </option>
      );
    });
    return (
      <select className="font-selector-items" name="">
        { options }
      </select>
    );
  }
}

// YourTypes kerning_training/scripts/view/font_selector_view.jsx
// Coded by Yota Odaka

'use strict';

import React from 'react';

export default class FontWeightSelectorView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      family: this.prpos.family,
      path: this.props.path,
      weight: this.props.weight
    };
  }
  renderFontWeight() {
    const className = '';
    return (
      <option value={ this.state.weight }>
      { this.state.weight }
      </option>
    );
  }
}

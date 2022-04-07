import React, { Component } from "react";

export default class PopUp extends Component {
  handleClick = () => {
    this.props.toggle();
  };

  render() {
    return (
      <div>
        <div className="centerrr">
          <div className="modal_content">
            <span className="close" onClick={this.handleClick}>
              &times;{" "}
            </span>
            <p>
              Welcome to WhaleSwap! We help efficiently execute large trades.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

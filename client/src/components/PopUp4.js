import React, { Component } from "react";

export default class PopUp4 extends Component {
  handleClick = () => {
    this.props.toggle();
  };

  render() {
    return (
      <div>
        <div>
          <div className="modal_content">
            <span className="close" onClick={this.handleClick}>
              &times;{" "}
            </span>
            <p>
            Pairs Info is just a summary of where this token pair (like ChainLink and Tether) is stored on the blockchain and the name of the two tokens being traded for each other.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

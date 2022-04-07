import React, { Component } from "react";

export default class PopUp3 extends Component {
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
            This calls the smart contract Factory.sol. The factory is the name of the contract that creates instances of the pair contract that dicatates 
            the behaviour of any swapping pair the user wishes to create. 
            To create a pair, enter the addresses of the two demonstration tokens, their corresponding names, and an integer for the interval.
            Interval is used to make the price/balance calculation more efficiently for long term orders.
            We check if the order is finished on interval blocks instead of every block.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

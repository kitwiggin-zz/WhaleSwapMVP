import React, { Component } from "react";

export default class PairPopUp1 extends Component {
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
            Instant Swaps is swaps executed through a regular AMM model, without TWAMM to 
            optimize the breaking up of large transactions. We show the return and the price impact 
            without this optimization, which is significant when you want to trade a large amount of one 
            token for another (ex: 100,000 of Token 1 for Token 2.) 
            To simplify, this is because price is determined by an algorithm and constant product formula. 
            Pair.sol is called. 
            </p>
          </div>
        </div>
      </div>
    );
  }
}

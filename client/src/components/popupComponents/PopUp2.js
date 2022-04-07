import React, { Component } from "react";

export default class PopUp2 extends Component {
  handleClick = () => {
    this.props.toggle();
    console.log("POPUP2")
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
              Token1 and Token2 are representations of real crypto tokens like ChainLink and 
              Tether and here we show the name, symbol, total liquidity supply, balance of the token 
              in the user's wallet, and the public blockhain key that we have for the address of the creater.
              Token1 and Token2 can represent the trade between any two token pairs which an AMM is used for.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

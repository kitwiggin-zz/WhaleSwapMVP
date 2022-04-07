import React, { Component } from "react";

export default class PairPopUp2 extends Component {
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
            Long Term (TWAP) Swaps divide large transactions into many many small ones using mathematical formulations which reduces the price impact. The idea of TWAMM is to have a mechanism by which a sufficiently large transaction is broken down into infinitely many small transactions over a period of time, rather than executing the transaction all at once. 

            </p>
          </div>
        </div>
      </div>
    );
  }
}

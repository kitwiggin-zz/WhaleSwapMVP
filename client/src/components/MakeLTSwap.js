import React from "react";

class MakeLTSwap extends React.Component {
  state = {
    app1DK: null,
    swapDK: null,
    amountIn: 0,
    recipient: "",
    numIntervals: 1,
  };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = async () => {
    const { drizzle, drizzleState, contractName, testTokenInNumber } =
      this.props;

    const pairContract = drizzle.contracts[contractName];

    const amountIn = parseInt(this.state.amountIn);
    const numIntervals = parseInt(this.state.numIntervals);

    const app1DK = await drizzle.contracts[
      "TestToken" + testTokenInNumber
    ].methods["approve"].cacheSend(pairContract.address, amountIn, {
      from: drizzleState.accounts[0],
    });

    const isX = testTokenInNumber === "1";

    const swapDK = await pairContract.methods["longTermSwap"].cacheSend(
      amountIn,
      isX,
      numIntervals,
      {
        from: drizzleState.accounts[0],
      }
    );

    this.setState({
      app1DK: app1DK,
      swapDK: swapDK,
      amountIn: 0,
      recipient: "",
      numIntervals: 0,
    });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.swapDK];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Transaction status: ${
      transactions[txHash] && transactions[txHash].status
    }`;
  };

  render() {
    let x = parseInt(this.props.x);
    let y = parseInt(this.props.y);
    let k = parseInt(this.props.k);
    let numIntervals =
      parseInt(this.state.numIntervals) > 0
        ? parseInt(this.state.numIntervals)
        : 1;
    let xInRate = parseInt(this.state.amountIn) / numIntervals;
    let expectedReturn = (numIntervals * (y - k / (x + xInRate))).toFixed(4);
    let idealReturn = (y / x) * parseInt(this.state.amountIn);
    let priceImpact = (
      (100 * (idealReturn - expectedReturn)) /
      idealReturn
    ).toFixed(4);

    return (
      <div>
        <div>
          <input
            type="text"
            placeholder={"Amount of Token In"}
            onChange={this.handleChange}
            id="amountIn"
          />
          <input
            type="text"
            placeholder={"Number of Block Intervals"}
            onChange={this.handleChange}
            id="numIntervals"
          />
          <input
            type="text"
            placeholder={"Recipient Address"}
            onChange={this.handleChange}
            id="recipient"
          />
          <button type="submit" onClick={this.handleSubmit}>
            Swap
          </button>
        </div>
        <h5>
          Estimated return from swapping {this.state.amountIn} coins of{" "}
          {this.props.tokenInName}:{" "}
        </h5>
        {this.state.amountIn && this.props.x && (
          <div>
            <p>Expected return: {expectedReturn}</p>
            <p>Price Impact: {priceImpact}%</p>
          </div>
        )}
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default MakeLTSwap;

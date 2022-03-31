import React from "react";

class MakeLTSwap extends React.Component {
  state = {
    app1DK: null,
    swapDK: null,
    amountIn: 0,
    recipient: "",
    numBlocks: 1,
  };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = async () => {
    const { drizzle, drizzleState, addressIn, addressOut, tokenInName } =
      this.props;

    const router = drizzle.contracts["Router"];

    const amountIn = parseInt(this.state.amountIn);

    const app1DK = await drizzle.contracts[tokenInName].methods[
      "approve"
    ].cacheSend(drizzle.contracts["Router"].address, amountIn, {
      from: drizzleState.accounts[0],
    });

    const swapDK = await router.methods["swapExactTokensForTokens"].cacheSend(
      amountIn,
      [addressIn, addressOut],
      this.state.recipient,
      {
        from: drizzleState.accounts[0],
      }
    );

    this.setState({
      app1DK: app1DK,
      swapDK: swapDK,
      amountIn: 0,
      recipient: "",
      numBlocks: 0,
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
    let numBlocks =
      parseInt(this.state.numBlocks) > 0 ? parseInt(this.state.numBlocks) : 1;
    let xInRate = parseInt(this.state.amountIn) / numBlocks;
    let expectedReturn = (numBlocks * (y - k / (x + xInRate))).toFixed(4);
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
            placeholder={"Number of blocks"}
            onChange={this.handleChange}
            id="numBlocks"
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

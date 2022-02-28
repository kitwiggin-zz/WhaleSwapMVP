import React from "react";
import GetBalance from "./GetBalance";

class MakeSwap extends React.Component {
  state = {
    app1DK: null,
    swapDK: null,
    amountIn: 0,
    recipient: "",
  };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = async () => {
    const { drizzle, drizzleState, addressIn, addressOut, tokenInName } =
      this.props;

    const router = drizzle.contracts["Router"];

    const amountIn = parseInt(this.state.amountIn);

    const app1DK = drizzle.contracts[tokenInName].methods["approve"].cacheSend(
      drizzle.contracts["Router"].address,
      amountIn,
      {
        from: drizzleState.accounts[0],
      }
    );

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
            placeholder={"Recipient Address"}
            onChange={this.handleChange}
            id="recipient"
          />
          <button type="submit" onClick={this.handleSubmit}>
            Submit
          </button>
        </div>
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default MakeSwap;

import React from "react";
import GetBalance from "./GetBalance";

class AddLiquidity extends React.Component {
  state = {
    app1DK: null,
    app2DK: null,
    addLiqDK: null,
    amount1: 0,
    amount2: 0,
  };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = async () => {
    console.log("handling submit");

    const { drizzle, drizzleState, address1, address2 } = this.props;

    console.log(drizzle);
    console.log(drizzleState);

    const router = drizzle.contracts["Router"];

    const amount1 = parseInt(this.state.amount1);
    const amount2 = parseInt(this.state.amount2);

    const app1DK = drizzle.contracts["TestToken1"].methods["approve"].cacheSend(
      drizzle.contracts["Router"].address,
      amount1,
      {
        from: drizzleState.accounts[0],
      }
    );

    const app2DK = drizzle.contracts["TestToken2"].methods["approve"].cacheSend(
      drizzle.contracts["Router"].address,
      amount2,
      {
        from: drizzleState.accounts[0],
      }
    );

    const addLiqDK = await router.methods["addLiquidity"].cacheSend(
      address1,
      address2,
      amount1,
      amount2,
      1,
      1,
      drizzleState.accounts[0],
      {
        from: drizzleState.accounts[0],
      }
    );

    this.setState({
      app1DK: app1DK,
      app2DK: app2DK,
      addLiqDK: addLiqDK,
      amount1: 0,
      amount2: 0,
    });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.addLiqDK];

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
          <h3>Add Liquidity: </h3>
          <input
            type="text"
            placeholder={"Amount of Token 1"}
            onChange={this.handleChange}
            id="amount1"
          />
          <input
            type="text"
            placeholder={"Amount of Token 2"}
            onChange={this.handleChange}
            id="amount2"
          />
          <button type="submit" onClick={this.handleSubmit}>
            Submit
          </button>
        </div>
        <div>{this.getTxStatus()}</div>
        <div>
          <h5>Your LP Tokens:</h5>
          <GetBalance
            drizzle={this.props.drizzle}
            drizzleState={this.props.drizzleState}
            tokenContract={this.props.contractName}
            address={this.props.drizzleState.accounts[0]}
          />
        </div>
        <div>
          <h5>Your Balance of Token 1:</h5>
          <GetBalance
            drizzle={this.props.drizzle}
            drizzleState={this.props.drizzleState}
            tokenContract={"TestToken2"}
            address={this.props.drizzleState.accounts[0]}
          />
        </div>
        <div>
          <h5>Your Balance of Token 2:</h5>
          <GetBalance
            drizzle={this.props.drizzle}
            drizzleState={this.props.drizzleState}
            tokenContract={"TestToken1"}
            address={this.props.drizzleState.accounts[0]}
          />
        </div>
      </div>
    );
  }
}

export default AddLiquidity;

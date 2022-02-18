import React from "react";

class CreatePair extends React.Component {
  state = { stackId: null, address1: "", address2: "", name1: "", name2: "" };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  setValue = (value) => {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.Factory;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["set"].cacheSend(value, {
      from: drizzleState.accounts[0],
    });

    // save the `stackId` for later reference
    this.setState({ stackId });
  };

  handleSubmit = () => {
    console.log("handling submit");
    console.log(this.state.address1);
    console.log(this.state.address2);
    console.log(this.state.name1);
    console.log(this.state.name2);

    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.Factory;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["createPair"].cacheSend(
      this.state.address1,
      this.state.address2,
      this.state.name1,
      this.state.name2,
      {
        from: drizzleState.accounts[0],
      }
    );

    this.setState({
      stackId: stackId,
      address1: "",
      address2: "",
      name1: "",
      name2: "",
    });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.stackId];

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
            //value={this.state.address1}
            placeholder={"address1"}
            onChange={this.handleChange}
            id="address1"
          />
          <input
            type="text"
            //value={this.state.address2}
            placeholder={"address2"}
            onChange={this.handleChange}
            id="address2"
          ></input>
          <input
            type="text"
            //value={this.state.name1}
            placeholder={"name1"}
            onChange={this.handleChange}
            id="name1"
          />
          <input
            type="text"
            //className={"name2"}
            //value={this.state.name2}
            placeholder={"name2"}
            onChange={this.handleChange}
            id="name2"
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

export default CreatePair;

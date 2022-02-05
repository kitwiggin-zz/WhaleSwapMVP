import React from "react";

class GetBalance extends React.Component {
  state = { dataKey: null };

  componentDidMount() {
    const { drizzle, tokenContract, address } = this.props;

    const contract = drizzle.contracts[tokenContract];

    // let drizzle know we want to watch the `myString` method
    const balanceDataKey = contract.methods["balanceOf"].cacheCall(address);

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey: balanceDataKey });
  }

  render() {
    // get the contract state from drizzleState
    const token = this.props.drizzleState.contracts[this.props.tokenContract];

    // using the saved `dataKey`, get the variable we're interested in
    const balance = token.balanceOf[this.state.dataKey];

    // if it exists, then we display its value
    return <>{balance && balance.value}</>;
  }
}

export default GetBalance;

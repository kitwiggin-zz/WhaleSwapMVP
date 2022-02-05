import React from "react";
import CreatePair from "./CreatePair";

class FactoryInfo extends React.Component {
  state = { dataKey: null };

  componentDidMount() {
    const { drizzle } = this.props;

    const contract = drizzle.contracts.Factory;

    // let drizzle know we want to watch the `myString` method
    const balanceDataKey = contract.methods["allPairsLength"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey: balanceDataKey });
  }

  render() {
    // get the contract state from drizzleState
    const token = this.props.drizzleState.contracts.Factory;

    // using the saved `dataKey`, get the variable we're interested in
    const allPairsLength = token.allPairsLength[this.state.dataKey];

    // if it exists, then we display its value
    return (
      <div>
        <p>Number of Pairs: {allPairsLength && allPairsLength.value}</p>
        <CreatePair
          drizzle={this.props.drizzle}
          drizzleState={this.props.drizzleState}
        />
      </div>
    );
  }
}

export default FactoryInfo;

import React from "react";
import CreatePair from "./CreatePair";

class FactoryInfo extends React.Component {
  state = { allPairsDK: null };

  componentDidMount() {
    const { drizzle } = this.props;

    const contract = drizzle.contracts.Factory;

    const allPairsDataKey = contract.methods["getAllPairs"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ allPairsDK: allPairsDataKey });
  }

  render() {
    // get the contract state from drizzleState
    const contract = this.props.drizzleState.contracts.Factory;

    const allPairs = contract.getAllPairs[this.state.allPairsDK];
    let allPairsLength = 0;
    if (allPairs) {
      allPairsLength = allPairs.value.length;
    }
    // if it exists, then we display its value
    return (
      <div>
        <p>Number of Pairs: {allPairsLength && allPairsLength}</p>
        <CreatePair
          drizzle={this.props.drizzle}
          drizzleState={this.props.drizzleState}
        />
      </div>
    );
  }
}

export default FactoryInfo;

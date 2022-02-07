import React from "react";
import CreatePair from "./CreatePair";
import PairListElement from "./PairListElement";

// Part 1: Create list of PairListElement Components passing each address from allPairs into a unique component
// Part 2: Make each element in the list clickable. When you click a pairelement it will navigate you to a new page
// where the address of that pair can be accessed so we can get that pair's info! :) <3

class FactoryInfo extends React.Component {
  state = { dataKey: null, allPairsDK: null };

  componentDidMount() {
    const { drizzle } = this.props;

    const contract = drizzle.contracts.Factory;

    // let drizzle know we want to watch the `myString` method
    const lengthDataKey = contract.methods["allPairsLength"].cacheCall();

    const allPairsDataKey = contract.methods["getAllPairs"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey: lengthDataKey, allPairsDK: allPairsDataKey });
  }

  render() {
    // get the contract state from drizzleState
    const contract = this.props.drizzleState.contracts.Factory;

    // using the saved `dataKey`, get the variable we're interested in
    const allPairsLength = contract.allPairsLength[this.state.dataKey];
    const allPairs = contract.getAllPairs[this.state.allPairsDK];

    console.log("hey");
    console.log(this.props.drizzle.contracts.address);

    // if it exists, then we display its value
    return (
      <div>
        <p>Number of Pairs: {allPairsLength && allPairsLength.value}</p>
        <CreatePair
          drizzle={this.props.drizzle}
          drizzleState={this.props.drizzleState}
        />
        <p>xx: {allPairs && allPairs.value}</p>
        
        
      </div>
    );
  }
}

export default FactoryInfo;

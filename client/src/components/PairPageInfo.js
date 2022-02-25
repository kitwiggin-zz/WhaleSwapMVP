import React from "react";

class PairPageInfo extends React.Component {
  state = { tkn0AddDK: null, tkn1AddDK: null };

  componentDidMount() {
    const { drizzle, drizzleState, contractName } = this.props;

    // console.log(drizzle);
    // console.log(drizzleState);
    // console.log(contractName);

    const contract = drizzle.contracts[contractName];

    // let drizzle know we want to watch the `myString` method
    const token0Add = contract.methods["token0"].cacheCall();
    const token1Add = contract.methods["token1"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ tkn0AddDK: token0Add, tkn1AddDK: token1Add });
  }

  render() {
    let Add1 = null;
    let Add2 = null;

    if (this.props.drizzleState.contracts[this.props.contractName]) {
      const pairContract =
        this.props.drizzleState.contracts[this.props.contractName];
      Add1 = pairContract.token0[this.state.tkn0AddDK];
      Add2 = pairContract.token1[this.state.tkn1AddDK];
    }

    // if it exists, then we display its value
    return (
      <div>
        <h5>Address of token 1:</h5>
        <p>{Add1 && Add1.value}</p>
        <h5>Address of token 2:</h5>
        <p>{Add2 && Add2.value}</p>
      </div>
    );
  }
}

export default PairPageInfo;

import React from "react";
import AddLiquidity from "./AddLiquidity";
import MakeSwap from "./MakeSwap";

class PairPageInfo extends React.Component {
  state = { tkn0AddDK: null, tkn1AddDK: null, amountsDK: null };

  componentDidMount() {
    const { drizzle, drizzleState, contractName } = this.props;

    console.log(drizzle);
    console.log(drizzleState);
    // console.log(contractName);

    const contract = drizzle.contracts[contractName];

    // let drizzle know we want to watch the `myString` method
    const token0Add = contract.methods["token0"].cacheCall();
    const token1Add = contract.methods["token1"].cacheCall();
    const getAmounts = contract.methods["getAmounts()"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      tkn0AddDK: token0Add,
      tkn1AddDK: token1Add,
      amountsDK: getAmounts,
    });
  }

  render() {
    let Add1 = null;
    let Add2 = null;
    let amounts = null;

    if (this.props.drizzleState.contracts[this.props.contractName]) {
      const pairContract =
        this.props.drizzleState.contracts[this.props.contractName];
      Add1 = pairContract.token0[this.state.tkn0AddDK];
      Add2 = pairContract.token1[this.state.tkn1AddDK];
      amounts = pairContract.getAmounts[this.state.amountsDK];
    }

    // if it exists, then we display its value
    return (
      <div>
        <h5>Address of token 1:</h5>
        <p>{Add1 && Add1.value}</p>
        <h5>Address of token 2:</h5>
        <p>{Add2 && Add2.value}</p>
        <h3>Pool info:</h3>
        <p> Amount of token 1: {amounts && amounts.value["amount0"]}</p>
        <p> Amount of token 2: {amounts && amounts.value["amount1"]}</p>
        {Add1 && Add2 && (
          <>
            <AddLiquidity
              drizzle={this.props.drizzle}
              drizzleState={this.props.drizzleState}
              contractName={this.props.contractName}
              address1={Add1.value}
              address2={Add2.value}
            />
            <div>
              <h3>Swap Token 1 for Token 2</h3>
              <MakeSwap
                drizzle={this.props.drizzle}
                drizzleState={this.props.drizzleState}
                addressIn={Add1.value}
                addressOut={Add2.value}
                tokenInName={"TestToken1"}
              />
            </div>
            <div>
              <h3>Swap Token 2 for Token 1</h3>
              <MakeSwap
                drizzle={this.props.drizzle}
                drizzleState={this.props.drizzleState}
                addressIn={Add2.value}
                addressOut={Add1.value}
                tokenInName={"TestToken2"}
              />
            </div>
          </>
        )}
      </div>
    );
  }
}

export default PairPageInfo;

import React from "react";
import AddLiquidity from "./AddLiquidity";
import MakeSwap from "./MakeSwap";
import TWAMMInfo from "./TWAMMInfo";
import PairPopUp1 from "./popupComponents/PairPopUp1";
import PairPopUp2 from "./popupComponents/PairPopUp2";

class PairPageInfo extends React.Component {
  state = {
    tkn0AddDK: null,
    tkn1AddDK: null,
    amountsDK: null,
    seen1: false,
    seen2: false,
  };

  componentDidMount() {
    const { drizzle, contractName } = this.props;

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

  togglePop1 = () => {
    this.setState({
      seen1: !this.state.seen1,
    });
  };

  togglePop2 = () => {
    this.setState({
      seen2: !this.state.seen2,
    });
  };

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
        <p>
          {" "}
          Spot price of a single Token1:{" "}
          {amounts &&
            (amounts.value["amount1"] / amounts.value["amount0"]).toFixed(
              4
            )}{" "}
          coins of Token 2
        </p>
        {Add1 && Add2 && amounts && (
          <>
            <AddLiquidity
              drizzle={this.props.drizzle}
              drizzleState={this.props.drizzleState}
              contractName={this.props.contractName}
            />
            <div>
              <div onClick={this.togglePop1}>
                <h2>Instant Swaps:</h2>
                <div>
                  <h3>Swap Token 1 for Token 2</h3>
                  <MakeSwap
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    contractName={this.props.contractName}
                    testTokenInNumber={"1"}
                    x={amounts.value["amount0"]}
                    y={amounts.value["amount1"]}
                    k={amounts.value["amount0"] * amounts.value["amount1"]}
                  />
                </div>
                <div>
                  <h3>Swap Token 2 for Token 1</h3>
                  <MakeSwap
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    contractName={this.props.contractName}
                    testTokenInNumber={"2"}
                    x={amounts.value["amount1"]}
                    y={amounts.value["amount0"]}
                    k={amounts.value["amount0"] * amounts.value["amount1"]}
                  />
                  {/* <MakeSwap
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    addressIn={Add2.value}
                    addressOut={Add1.value}
                    tokenInName={"TestToken2"}
                    x={amounts.value["amount1"]}
                    y={amounts.value["amount0"]}
                    k={amounts.value["amount0"] * amounts.value["amount1"]}
                  /> */}
                </div>

                {this.state.seen1 ? (
                  <PairPopUp1 toggle={this.togglePop1} />
                ) : null}
              </div>
              <div onClick={this.togglePop2}>
                <TWAMMInfo
                  drizzle={this.props.drizzle}
                  drizzleState={this.props.drizzleState}
                  contractName={this.props.contractName}
                />
                {this.state.seen2 ? (
                  <PairPopUp2 toggle={this.togglePop2} />
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default PairPageInfo;

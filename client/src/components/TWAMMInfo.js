import React from "react";
import MakeLTSwap from "./MakeLTSwap";

class TWAMMInfo extends React.Component {
  state = {
    intervalDK: null,
    tkn0AddDK: null,
    tkn1AddDK: null,
    amountsDK: null,
  };

  componentDidMount() {
    const { drizzle, drizzleState, contractName } = this.props;

    console.log(drizzle);
    console.log(drizzleState);

    const contract = drizzle.contracts[contractName];

    // let drizzle know we want to watch the `myString` method
    const interval = contract.methods["getLongTermOrderInterval()"].cacheCall();
    const token0Add = contract.methods["token0"].cacheCall();
    const token1Add = contract.methods["token1"].cacheCall();
    const getAmounts = contract.methods["getAmounts()"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      intervalDK: interval,
      tkn0AddDK: token0Add,
      tkn1AddDK: token1Add,
      amountsDK: getAmounts,
    });
  }

  render() {
    let interval = null;
    let add1 = null;
    let add2 = null;
    let amounts = null;

    if (this.props.drizzleState.contracts[this.props.contractName]) {
      const pairContract =
        this.props.drizzleState.contracts[this.props.contractName];
      interval = pairContract.getLongTermOrderInterval[this.state.intervalDK];
      add1 = pairContract.token0[this.state.tkn0AddDK];
      add2 = pairContract.token1[this.state.tkn1AddDK];
      amounts = pairContract.getAmounts[this.state.amountsDK];
    }

    return (
      <div>
        {interval && add1 && add2 && amounts && (
          <>
            <h2>Long Term (TWAP) Swaps:</h2>
            <div>
              <h3>Size of block intervals:</h3>
              <p>{interval.value}</p>
              <div>
                <div>
                  <h3>Swap Token 1 for Token 2</h3>
                  <MakeLTSwap
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    addressIn={add1.value}
                    addressOut={add2.value}
                    tokenInName={"TestToken1"}
                    x={amounts.value["amount0"]}
                    y={amounts.value["amount1"]}
                    k={amounts.value["amount0"] * amounts.value["amount1"]}
                  />
                </div>
                <div>
                  <h3>Swap Token 2 for Token 1</h3>
                  <MakeLTSwap
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    addressIn={add2.value}
                    addressOut={add1.value}
                    tokenInName={"TestToken2"}
                    x={amounts.value["amount1"]}
                    y={amounts.value["amount0"]}
                    k={amounts.value["amount0"] * amounts.value["amount1"]}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default TWAMMInfo;

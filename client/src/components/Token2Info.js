import React from "react";

class Token2Info extends React.Component {
  state = {
    tokenNameDK: null,
    totalSupplyDK: null,
    symbolDK: null,
    creatorDK: null,
    balanceDK: null,
  };

  componentDidMount() {
    const { drizzle, drizzleState } = this.props;

    console.log(drizzle);
    console.log(drizzleState);

    const contract = drizzle.contracts.TestToken2;

    // let drizzle know we want to watch the `myString` method
    const tokenNameDataKey = contract.methods["name"].cacheCall();
    const totalSupplyDataKey = contract.methods["totalSupply"].cacheCall();
    const symbolDataKey = contract.methods["symbol"].cacheCall();
    const creatorDataKey = contract.methods["creator"].cacheCall();

    // I'm pissed off cos i can't work out how to get a cacheCall for a bloody mapping
    // const balanceDataKey = contract.methods["balanceOf"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      tokenNameDK: tokenNameDataKey,
      totalSupplyDK: totalSupplyDataKey,
      symbolDK: symbolDataKey,
      creatorDK: creatorDataKey,
      // balanceDK: balanceDataKey,
    });
  }

  render() {
    // get the contract state from drizzleState
    const { TestToken2 } = this.props.drizzleState.contracts;

    // using the saved `dataKey`, get the variable we're interested in
    const tokenName = TestToken2.name[this.state.tokenNameDK];
    const totalSupply = TestToken2.totalSupply[this.state.totalSupplyDK];
    const symbol = TestToken2.symbol[this.state.symbolDK];
    const creator = TestToken2.creator[this.state.creatorDK];
    //const creatorBalance = TestToken1.balanceOf;

    // if it exists, then we display its value
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Token Details:</th>
            </tr>
            <tr>
              <td>Name of Second Token:</td>
              <td>{tokenName && tokenName.value}</td>
            </tr>
            <tr>
              <td>Symbol of Second Token:</td>
              <td>{symbol && symbol.value}</td>
            </tr>
            <tr>
              <td>Total Supply of Second Token:</td>
              <td>{totalSupply && totalSupply.value}</td>
            </tr>
            <tr>
              <td>Address of Creator:</td>
              <td>{creator && creator.value}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Token2Info;

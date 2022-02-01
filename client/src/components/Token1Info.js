import React from "react";

/*
I'm quite unhappy with this - I have spent a while trying to make a generic
component that takes only the address of the contract that stores the token
and use that to find the relevant information.
My tactic was to start by pretending we didn't have access to the token initially
by deleting it from the drizzle context. Then, I would add it back using the token's
address and the ERC20.json file (drizzle.addContract(...)) - Then, I was hoping
to use this contract which is arbitrarily named by the component but now exists in 
the context. 
Like this, we would be more closely simulating an AMM that just knows the address
of the token's contract (just by ignoring the deleting part which only exists cos 
this is a simulation etc.)

Long story short, I couldn't work it out so I'm just going to do it the
hard coded way and ill come back to it if possible :)
*/

/*
TODO: Work out how tf do get data from a bloody mapping
*/

class Token1Info extends React.Component {
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

    const contract = drizzle.contracts.TestToken1;

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
    const { TestToken1 } = this.props.drizzleState.contracts;

    // using the saved `dataKey`, get the variable we're interested in
    const tokenName = TestToken1.name[this.state.tokenNameDK];
    const totalSupply = TestToken1.totalSupply[this.state.totalSupplyDK];
    const symbol = TestToken1.symbol[this.state.symbolDK];
    const creator = TestToken1.creator[this.state.creatorDK];
    //const creatorBalance = TestToken1.balanceOf;
    // if (creator && creator.value) {
    //   console.log(creator.value);
    //   const pp = this.props.drizzle.contracts.TestToken1.methods.balanceOf(
    //     creator.value
    //   );
    //   console.log(pp);
    // }

    // if it exists, then we display its value
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Token Details:</th>
            </tr>
            <tr>
              <td>Name of First Token:</td>
              <td>{tokenName && tokenName.value}</td>
            </tr>
            <tr>
              <td>Symbol of First Token:</td>
              <td>{symbol && symbol.value}</td>
            </tr>
            <tr>
              <td>Total Supply of First Token:</td>
              <td>{totalSupply && totalSupply.value}</td>
            </tr>
            <tr>
              <td>Address of Creator:</td>
              <td>{creator && creator.value}</td>
            </tr>
            <tr>
              <td>Balance of Creator:</td>
              <td>:(</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Token1Info;

import React from "react";
import GetBalance from "./GetBalance";

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

I WORKED OUT HOW TO MAKE IT GENERIC BY USING THE CONTRACT NAME YAYYYYYYY!!!!
*/

class TokenInfo extends React.Component {
  state = {
    tokenNameDK: null,
    totalSupplyDK: null,
    symbolDK: null,
    creatorDK: null,
  };

  componentDidMount() {
    const { drizzle, drizzleState, token } = this.props;

    const contract = drizzle.contracts[token];

    // let drizzle know we want to watch the `myString` method
    const tokenNameDataKey = contract.methods["name"].cacheCall();
    const totalSupplyDataKey = contract.methods["totalSupply"].cacheCall();
    const symbolDataKey = contract.methods["symbol"].cacheCall();
    const creatorDataKey = contract.methods["creator"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      tokenNameDK: tokenNameDataKey,
      totalSupplyDK: totalSupplyDataKey,
      symbolDK: symbolDataKey,
      creatorDK: creatorDataKey,
    });
  }

  render() {
    // get the contract state from drizzleState
    const token = this.props.drizzleState.contracts[this.props.token];

    // using the saved `dataKey`, get the variable we're interested in
    const tokenName = token.name[this.state.tokenNameDK];
    const totalSupply = token.totalSupply[this.state.totalSupplyDK];
    const symbol = token.symbol[this.state.symbolDK];
    const creator = token.creator[this.state.creatorDK];

    // if it exists, then we display its value
    return (
      <div>
        <table id="tokentable">
          <tbody>
            <tr>
              <th>Token Details:</th>
            </tr>
            <tr>
              <td>Name of Token:</td>
              <td>{tokenName && tokenName.value}</td>
            </tr>
            <tr>
              <td>Symbol of Token:</td>
              <td>{symbol && symbol.value}</td>
            </tr>
            <tr>
              <td>Total Supply of Token:</td>
              <td>{totalSupply && totalSupply.value}</td>
            </tr>
            <tr>
              <td>Address of Creator:</td>
              <td>{creator && creator.value}</td>
            </tr>
            <tr>
              <td>Balance of Creator:</td>
              <td>
                {creator ? (
                  <GetBalance
                    drizzle={this.props.drizzle}
                    drizzleState={this.props.drizzleState}
                    tokenContract={this.props.token}
                    address={creator.value}
                  />
                ) : (
                  "Could not get creator address"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default TokenInfo;

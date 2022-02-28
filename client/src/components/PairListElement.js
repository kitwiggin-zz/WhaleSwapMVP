import React from "react";

// Import Pair ABI to add the pair contract to drizzle
import Pair from "./../contracts/Pair.json";

class PairListElement extends React.Component {
  state = { name1DK: null, name2DK: null };

  componentDidMount() {
    const { drizzle, drizzleState } = this.props;

    console.log(drizzle);
    console.log(drizzleState);

    if (this.props.pairAddress) {
      this.addPairContract();
    }

    const contract =
      drizzle.contracts[
        `Pair${this.props.pairAddress.toLowerCase().slice(-4)}`
      ];

    // let drizzle know we want to watch the `myString` method
    const xDataKey = contract.methods["token0Name"].cacheCall();
    const yDataKey = contract.methods["token1Name"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ name1DK: xDataKey, name2DK: yDataKey });
  }

  addPairContract = async () => {
    let contractName = `Pair${this.props.pairAddress.toLowerCase().slice(-4)}`;

    if (
      !Object.keys(this.props.drizzleState.contracts).includes(contractName)
    ) {
      let web3Contract = new this.props.drizzle.web3.eth.Contract(
        Pair["abi"],
        this.props.pairAddress
      );
      let contractName = `Pair${this.props.pairAddress
        .toLowerCase()
        .slice(-4)}`;

      await this.props.drizzle.addContract({ contractName, web3Contract });
    }
  };

  render() {
    let name1 = null;
    let name2 = null;

    if (
      this.props.drizzleState.contracts[
        `Pair${this.props.pairAddress.toLowerCase().slice(-4)}`
      ]
    ) {
      const pairContract =
        this.props.drizzleState.contracts[
          `Pair${this.props.pairAddress.toLowerCase().slice(-4)}`
        ];
      name1 = pairContract.token0Name[this.state.name1DK];
      name2 = pairContract.token1Name[this.state.name2DK];
    }

    // if it exists, then we display its value
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td>Address: {this.props.pairAddress}</td>
              <td>token 0 Name: {name1 && name1.value}</td>
              <td>token 1 Name: {name2 && name2.value}</td>
            </tr>
          </tbody>
        </table>
      </div>
      //pairInfo
    );
  }
}

export default PairListElement;

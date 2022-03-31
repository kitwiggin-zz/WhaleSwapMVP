import React from "react";
import PairPageInfo from "./PairPageInfo";
import Pair from "./../contracts/Pair.json";

class PairPage extends React.Component {
  state = { loading: true, drizzleState: null, currPair: null };

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState: drizzleState });
        this.addPairContract(window.location.search.substring(1));
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  addPairContract = async (address) => {
    let contractName = "Pair" + address.toLowerCase().slice(-4);

    if (
      !Object.keys(this.state.drizzleState.contracts).includes(contractName)
    ) {
      let web3Contract = new this.props.drizzle.web3.eth.Contract(
        Pair["abi"],
        address
      );
      await this.props.drizzle.addContract({ contractName, web3Contract });
      this.setState({ currPair: contractName });
    }
  };

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <div id="secondpagediv">
        <h3>Pair Info:</h3>
        {this.state.currPair && (
          <>
            <PairPageInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              contractName={this.state.currPair}
            />
          </>
        )}
      </div>
    );
  }
}

//export default (props) => <PairPage {...props} params={useParams()} />;
export default PairPage;

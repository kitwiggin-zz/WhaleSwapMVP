
import React from "react";
import { useParams } from 'react-router-dom';
import ReadString from "./ReadString";
import SetString from "./SetString";
import TokenInfo from "./TokenInfo";
import FactoryInfo from "./FactoryInfo";
import PairsInfo from "./PairsInfo";

export function withRouter(Children){
  return(props)=>{

     const match  = {params: useParams()};
     return <Children {...props}  match = {match}/>
 }
}

class MainPage extends React.Component  {
  state = { loading: true, drizzleState: null };

  componentDidMount() {
    const { drizzle } = this.props.params;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <div className="App">
        <ReadString
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
        <SetString
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
        <div>
          <div>Current User Address (the one logged into MetaMask):</div>
          <div>{this.state.drizzleState.accounts[0]}</div>
        </div>
        <div>
          <div>
            <h3>First Token Info:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken1.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken1"
            />
          </div>
          <div>
            <h3>Second Token Info:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken2.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken2"
            />
          </div>
        </div>
        <div>
          <div>
            <h3>Factory Info:</h3>
            <h5>Address of Factory Contract:</h5>
            <p>{this.props.drizzle.contracts.Factory.address}</p>
            <FactoryInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
            />
          </div>
        </div>
        <div>
          <div>
            <h3>Pairs Info:</h3>
            <PairsInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}

            />
          </div>
        </div>

        
      </div>
    );
  }
}

export default withRouter(MainPage);

import "./App.css";
import React from "react";
import TokenInfo from "./components/TokenInfo";
import FactoryInfo from "./components/FactoryInfo";
import PairsInfo from "./components/PairsInfo";
import image from './a.png';

//import PairListElement from "./components/PairListElement";


class App extends React.Component {
  state = { loading: true, drizzleState: null };

  componentDidMount() {
    const { drizzle } = this.props;

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

      <div class="App">
      <div id="img">
      <img src={image} width="200" height="200"/>
      </div>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>
        <div>
          <div>Current User Address (the one logged into MetaMask):</div>
          <div>{this.state.drizzleState.accounts[0]}</div>
        </div>
        <div >
          <div class="left-column"> 
            <h3>First Token:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken1.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken1"
            />
          </div>
          <div class="right-column"> 
            <h3>Second Token:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken2.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken2"
            />
          </div>
        </div > 

          <div class="factory">
            <h3>Factory Info:</h3>
            <h5>Address of Factory Contract:</h5>
            <p>{this.props.drizzle.contracts.Factory.address}</p>
            <FactoryInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
            />
          </div>
        
      
          <div class="pairs">
            <h3>Pairs Info:</h3>
            <PairsInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
            />
          </div>
      </div>
    );
  }
}

export default App;

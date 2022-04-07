import "./App.css";
import React from "react";
import TokenInfo from "./components/TokenInfo";
import FactoryInfo from "./components/FactoryInfo";
import PairsInfo from "./components/PairsInfo";
import image from "./a.png";
import user from "./user.png";
import PopUp from "./components/popupComponents/PopUp";
import PopUp2 from "./components/popupComponents/PopUp2";
import PopUp3 from "./components/popupComponents/PopUp3";
import PopUp4 from "./components/popupComponents/PopUp4";

class App extends React.Component {
  state = {
    loading: true,
    drizzleState: null,
    seen: false,
    seen2: false,
    seen3: false,
    seen4: false,
  };

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

  togglePop = () => {
    this.setState({
      seen: !this.state.seen,
    });
  };

  togglePop2 = () => {
    this.setState({
      seen2: !this.state.seen2,
    });
  };

  togglePop3 = () => {
    this.setState({
      seen3: !this.state.seen3,
    });
  };

  togglePop4 = () => {
    this.setState({
      seen4: !this.state.seen4,
    });
  };

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <div className="App">
        <div>
          <div id="img" onClick={this.togglePop}>
            <img src={image} width="200" height="200" />
          </div>
          {this.state.seen ? <PopUp toggle={this.togglePop} /> : null}
        </div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        ></link>
        <div>
          <img src={user} width="100" height="100" />
          <div>Current User Address (the one logged into MetaMask):</div>
          <div>{this.state.drizzleState.accounts[0]}</div>
        </div>
        <div>
          <div className="left-column color" onClick={this.togglePop2}>
            <h3>First Token:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken1.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken1"
            />
          </div>
          <div className="right-column color" onClick={this.togglePop2}>
            <h3>Second Token:</h3>
            <h5>Address of Token Contract:</h5>
            <p>{this.props.drizzle.contracts.TestToken2.address}</p>
            <TokenInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
              token="TestToken2"
            />
          </div>
          {this.state.seen2 ? <PopUp2 toggle={this.togglePop2} /> : null}
        </div>
        <div>
          <div className="factory App" onClick={this.togglePop3}>
            <h3>Factory Info:</h3>
            <h5>Address of Factory Contract:</h5>
            <p>{this.props.drizzle.contracts.Factory.address}</p>
            <FactoryInfo
              drizzle={this.props.drizzle}
              drizzleState={this.state.drizzleState}
            />
          </div>
          {this.state.seen3 ? <PopUp3 toggle={this.togglePop3} /> : null}
        </div>
        <div className="pairs App" onClick={this.togglePop4}>
          <h3>Pairs Info:</h3>
          <PairsInfo
            drizzle={this.props.drizzle}
            drizzleState={this.state.drizzleState}
          />
        </div>
        {this.state.seen4 ? <PopUp4 toggle={this.togglePop4} /> : null}
      </div>
    );
  }
}

export default App;

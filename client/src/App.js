import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { Route, Routes } from 'react-router-dom'
import MainPage from "./components/MainPage"
import { BrowserRouter } from 'react-router-dom';

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
      <div className="App">
        <BrowserRouter>
              <Routes>
                <Route path='/main' render={() => <MainPage drizzle={this.props.drizzle} drizzleState={this.state.drizzleState} /> } />
                
              </Routes>
              </BrowserRouter>
            </div>
    );
  }
}

export default App;

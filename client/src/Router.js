import { Routes, Route } from "react-router-dom";
import React from "react";
import App from "./App";
import PairPage from "./components/PairPage";

class Router extends React.Component {
  render() {
    return (
      <div>
        <Routes>
          <Route path="/" element={<App drizzle={this.props.drizzle} />} />
          <Route
            path="/pair"
            element={<PairPage drizzle={this.props.drizzle} />}
          />
        </Routes>
      </div>
    );
  }
}

export default Router;

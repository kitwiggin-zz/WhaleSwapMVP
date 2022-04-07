import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";
import { Drizzle } from "@drizzle/store";
import Factory from "./contracts/Factory.json";
import Token1 from "./contracts/TestToken1.json";
import Token2 from "./contracts/TestToken2.json";

// let drizzle know what contracts we want and how to access our test blockchain
const options = {
  contracts: [Factory, Token1, Token2],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:7545", // 7545 for Ganache, 9545 for 'truffle develop' cmd line stuff
    },
  },
};

// setup the drizzle store and drizzle
const drizzle = new Drizzle(options);

/*
 * Note: Probably nothing but I thought that it might be important to initialise the Drizzle instance
 * outside of App.js like it's done here and then pass in the instance as a prop. Even if this makes no
 * difference, my impression is that it's critical to be very careful with how and when we fuck with the
 * drizzle object. If done right, the whole front end can be built in simple React cos the drizzle package
 * is great. However, I feel like it's going to be easy to get this bit wrong which could lead to a load of
 * bugs that I would completely not understand and might require Redux of advanced React patterns.
 * To make a long thought short, I think we need to be meticulous with the drizzle object and state to make
 * our lives easier :)
 */

ReactDOM.render(
  <div>
    <BrowserRouter>
      <Router drizzle={drizzle} />
    </BrowserRouter>
  </div>,
  document.getElementById("root")
);

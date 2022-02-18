import React from "react";
import PairListElement from "./PairListElement";
import { Table, Pagination, Row, Col, Divider, Slider } from "antd";
//const navigate = useNavigate();

class PairsInfo extends React.Component {
  state = { pairsDataKey: null };

  componentDidMount() {
    const { drizzle, drizzleState, allPairs } = this.props;

    const contract = drizzle.contracts.Factory;

    // let drizzle know we want to watch the `myString` method

    const allPairsDKey = contract.methods["getAllPairs"].cacheCall();

    // let drizzle know we want to watch the `myString` method
    //const dataKey = contract.methods["myString"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ pairsDataKey: allPairsDKey });
  }

  render() {
    const contract = this.props.drizzleState.contracts.Factory;

    // using the saved `dataKey`, get the variable we're interested in
    const allPairs = contract.getAllPairs[this.state.pairsDataKey];
    const p = allPairs?.value;
    console.log("pairss", allPairs);
    console.log("val", p);
    // p?.map((add) => (
    //   <PairListElement
    //     drizzle={this.props.drizzle}
    //     drizzleState={this.props.drizzleState}
    //     pairAddress={add}
    //   />
    // ));
    console.log("pairlist", p);
    // if it exists, then we display its value

    return (
      //<p>Pair List Address: {this.props.pairAddress}</p>
      <div>
        {/* {p?.map((add) => (
          <a href={"/pair/" + add.toLowerCase().slice(-4)}>
            {" "}
            <PairListElement
              drizzle={this.props.drizzle}
              drizzleState={this.props.drizzleState}
              pairAddress={add}
            ></PairListElement>
          </a>
        ))} */}
        {/* <Table dataSource={p}></Table> */}
        <ul>
          {p?.map((add) => (
            <li key={add}>
              <a href={"/pair?" + add.toLowerCase().slice(-4)}>
                <PairListElement
                  drizzle={this.props.drizzle}
                  drizzleState={this.props.drizzleState}
                  pairAddress={add}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
//<div onClick = {event =>  window.location.href='https://stackoverflow.com/questions/62861269/attempted-import-error-usehistory-is-not-exported-from-react-router-dom'} >

export default PairsInfo;

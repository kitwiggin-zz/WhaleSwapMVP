import React from "react";
import PairListElement from "./PairListElement";
//import { Table, Pagination, Row, Col, Divider, Slider } from "antd";
//const navigate = useNavigate();

class PairsInfo extends React.Component {
  state = { pairsDataKey: null };

  componentDidMount() {
    const contract = this.props.drizzle.contracts.Factory;

    const allPairsDKey = contract.methods["getAllPairs"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ pairsDataKey: allPairsDKey });
  }

  render() {
    const contract = this.props.drizzleState.contracts.Factory;

    // using the saved `dataKey`, get the variable we're interested in
    const allPairs = contract.getAllPairs[this.state.pairsDataKey];
    const p = allPairs?.value;

    return (
      <ul>
        {p?.map((add) => (
          <li key={add}>
            <a href={"/pair?" + add}>
              <PairListElement
                drizzle={this.props.drizzle}
                drizzleState={this.props.drizzleState}
                pairAddress={add}
              />
            </a>
          </li>
        ))}
      </ul>
    );
  }
}

export default PairsInfo;

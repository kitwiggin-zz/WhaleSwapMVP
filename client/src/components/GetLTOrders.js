import React from "react";

class GetLTOrders extends React.Component {
  state = { createdOrdersDK: null };

  componentDidMount() {
    const { drizzle, contractName } = this.props;

    const pairContract = drizzle.contracts[contractName];

    const createdOrders =
      pairContract.methods["getCreatedLongTermOrders()"].cacheCall();

    this.setState({ createdOrdersDK: createdOrders });
  }

  render() {
    // get the contract state from drizzleState
    const pairContract =
      this.props.drizzleState.contracts[this.props.contractName];

    const createdOrders =
      pairContract.getCreatedLongTermOrders[this.state.createdOrdersDK];

    // if it exists, then we display its value
    return (
      <div>
        {createdOrders && (
          <div>
            <p>
              Num LT orders trading Token 1 for Token 2:{" "}
              {createdOrders.value.ordersXtoY.length}
            </p>
            <p>
              Num LT orders trading Token 2 for Token 1:{" "}
              {createdOrders.value.ordersYtoX.length}
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default GetLTOrders;

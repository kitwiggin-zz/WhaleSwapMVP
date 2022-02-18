import React from "react";
import { useParams } from "react-router-dom";
class PairPage extends React.Component {
  componentDidMount() {
    const { address } = this.props.address;
    // ...
  }

  render() {
    return (
      <div>
        <div>asdfasdf</div>
        <div>qwerty</div>
        <p>Hey!</p>
      </div>
    );
  }
}

//export default (props) => <PairPage {...props} params={useParams()} />;
export default PairPage;

import React from "react";
import { useParams } from 'react-router-dom';
class SpecificPairPage extends React.Component {
    componentDidMount() {
        const { address } = this.props.params;
        // ...
    }
}

export default (props) => (
    <SpecificPairPage
        {...props}
        params={useParams()}
    />
);
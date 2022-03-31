import React, { Component } from "react";


export default class PopUp extends Component {
  handleClick = () => {
   this.props.toggle();
  };

render() {
  return (
    <div>
   <div class="centerrr">
     <div class="modal_content" >
     <span class="close" onClick={this.handleClick}>&times;    </span>
     <p>Welcome to WhaleSwap! We help efficiently execute large trades.</p>
    </div>
   </div>
   </div>
  );
 }
}
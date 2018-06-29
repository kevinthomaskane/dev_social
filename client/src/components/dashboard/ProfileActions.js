import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addPicture } from "../../actions/authActions";
import "./ProfileActions.css"

class ProfileActions extends Component {

  state = {
    picture: ""
  }
  onChange = (e) => {
    this.setState({picture: e.target.files[0]})
  };

  onSubmit = (e) => {
    const fd = new FormData();
    fd.append("image", this.state.picture, this.state.picture.name)
    this.props.addPicture(fd)
  }

  render() {
    let myButtonText = this.state.picture !== "" ? "Ready to Upload" : "Upload Image"
    let disabled = this.state.picture !== "" ? false : true
    return (
      <div className="btn-group mb-4" role="group">
        <Link to="/edit-profile" className="btn btn-light">
          <i className="fas fa-user-circle text-info mr-1" /> Edit Profile
        </Link>
        <Link to="/add-experience" className="btn btn-light">
          <i className="fab fa-black-tie text-info mr-1" />
          Add Experience
        </Link>
        <Link to="/add-education" className="btn btn-light">
          <i className="fas fa-graduation-cap text-info mr-1" />
          Add Education
        </Link>
        <input style={{"width": 230}} id="picture-upload" type="file" name="picture" className="custom-file-input" onChange={this.onChange}/>
        <button disabled={disabled} id="upload-button" onClick={this.onSubmit}>{myButtonText}</button>
      </div>
    );
  }
}

ProfileActions.propTypes = {
  addPicture: PropTypes.func.isRequired
};

export default connect(
  null,
  { addPicture }
)(ProfileActions);

import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { GET_ERRORS } from "./types";
import { SET_CURRENT_USER } from "./types";

//redux thunk allows us to dispatch another action from within the current action

// register user
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(result => {
      history.push("/login");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//add picture
export const addPicture = (pic) => dispatch => {
  console.log("pic", pic)
  axios
    .post("/api/users/picture", pic)
    .then(res => console.log(res)
    )
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//login get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      //save to localstorage
      const { token } = res.data; //destructure the response object to the token
      localStorage.setItem("jwttoken", token);
      //set token to Auth header
      setAuthToken(token);
      //decode the token to get the user data
      const decoded = jwt_decode(token);
      //set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//set logged in user
export const setCurrentUser = decoded => {
  return { type: SET_CURRENT_USER, payload: decoded };
};

//log user out
export const logoutUser = () => dispatch => {
  //remove token from localstorage
  localStorage.removeItem("jwttoken");
  //remove auth header for future requests
  setAuthToken(false);
  //set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};

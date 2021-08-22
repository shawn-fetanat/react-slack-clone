import React from "react";
import Button from "@material-ui/core/Button";
import "./Login.css";
import { auth, provider } from "./firebase";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";

function Login() {
  const [state, dispatch] = useStateValue();

  const signIn = (e) => {
    e.preventDefault();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        console.log(result);
        dispatch({
          //dispatch SET_USER ACTION
          type: actionTypes.SET_USER,
          user: result.user, //push user into the data layer
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  console.log(state);

  return (
    <div className="login">
      <div className="login__container">
        <img
          src="https://webdesigntips.blog/wp-content/uploads/2019/02/Slack-sparks-further-outrage-with-tweak-to-new-logo-850x491.jpg"
          alt=""
        />
        <h1>Sign-In</h1>
        <p>shawn.react.slack.clone.com</p>
        <Button onClick={signIn}>Sign In with Google</Button>
      </div>
    </div>
  );
}

export default Login;

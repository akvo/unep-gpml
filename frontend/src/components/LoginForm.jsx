import React, {useState, useEffect} from 'react'
import { Auth0Lock } from 'auth0-lock'

const authOption = {
  theme: {
    logo: '/gpml-logo.png',
    primaryColor: '#31324F'
  },
  languageDictionary: {
    emailInputPlaceholder: "example@un.org",
    title: "GPML Digital Platform"
  },
  auth: {
      redirect:false,
      loginAfterSignup: true
  },
};

const LoginForm = () => {
    const [session, setSession] = useState("");

    const auth = new Auth0Lock (
        process.env.REACT_APP_AUTH0_CLIENT_ID,
        process.env.REACT_APP_AUTH0_DOMAIN,
        authOption
    ).on('authenticated' , (authResult) => {
        console.log(authResult);
        if (authResult && authResult.accessToken && authResult.idToken) {
            setSession(authResult);
        }
    });

    const check = () => {
        console.log(session);
        auth.checkSession({}, function (error, authResult) {
          if (error || !authResult) {
              console.log(authResult);
              console.log(error);
          } else {
            auth.getUserInfo(authResult.accessToken, function (error, profile) {
              console.log(error, profile);
            });
          }
        });
    }

    return (
        <div>
            <button id="login-button" onClick={e => auth.show()}>Login</button>
            <button onClick={e => check()} id="check">check</button>
        </div>
    )
}

export default LoginForm;

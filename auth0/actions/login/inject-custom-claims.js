/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
/*The following is a description of each evironment variable necessary for this Auth0 Action to work properly:
  - AUTH0_TENANT_URL: The URL of the Auth0 tenant which are going to authenticate and retrieve an IdToken (i.e., for prod: https://unep-gpml.eu.auth0.com)
  - GPML_AUTH0_ACTIONS_CLIENT_ID:" The client ID of the 'Auth0 Actions' application found under the 'Applications' section in Auth0.
  - GPML_AUTH0_ACTIONS_CLIENT_SECRET: The client secret of the 'Auth0 Actions' application found under the 'Applications' section in Auth0.
  - GPML_AUTH0_ACTIONS_USER_EMAIL: The user email used to retrieve the token. It should be already created as 'auth0-actions' followed by the environment 'prod' and email domain.
  - GPML_AUTH0_ACTIONS_USER_PASSWORD: The above user's password.
  - GPML_APP_DOMAIN_URL: The GPML application's URL.
*/
exports.onExecutePostLogin = async (event, api) => {
    if (event.authorization &&
        // Avoid a loop in the login action. Requesting the IdToken for actions user below is considered a login by Auth0.
        // So make sure we don't do any of this stuff if we are dealing with the actions user itself.
        (event.user.email != event.secrets.GPML_AUTH0_ACTIONS_USER_EMAIL)) {
        const axios = require('axios');
        try {
            const response = await axios({
                method: 'post',
                url: `${event.secrets.AUTH0_TENANT_URL}/oauth/token`,
                headers: { 'content-type': 'application/json' },
                // Auth0 Actions cannot take more than 10 seconds to finish[1].
                // [1] - https://auth0.com/docs/customize/actions/limitations
                timeout: 7000,
                data: {
                    'client_id': event.secrets.GPML_AUTH0_ACTIONS_CLIENT_ID,
                    'client_secret': event.secrets.GPML_AUTH0_ACTIONS_CLIENT_SECRET,
                    'username': event.secrets.GPML_AUTH0_ACTIONS_USER_EMAIL,
                    'password': event.secrets.GPML_AUTH0_ACTIONS_USER_PASSWORD,
                    'grant_type': 'password',
                    'scope': 'openid email profile'
                }
            });

            const apiResponse = await axios({
                method: 'get',
                url: `${event.secrets.GPML_APP_DOMAIN_URL}/api/stakeholder`,
                params: { 'email-like': event.user.email },
                headers: { 'Authorization': `Bearer ${response.data.id_token}` },
                // Auth0 Actions cannot take more than 10 seconds to finish[1].
                // [1] - https://auth0.com/docs/customize/actions/limitations
                timeout: 2500
            });

            if (apiResponse.data.stakeholders && apiResponse.data.stakeholders[0] && apiResponse.data.stakeholders[0].role) {
                api.idToken.setCustomClaim('https://digital.gpmarinelitter.org/role', apiResponse.data.stakeholders[0].role);
            }
        } catch (err) {
            console.log(err);
        }
    }
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };

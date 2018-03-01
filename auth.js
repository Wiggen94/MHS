// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '363844550760695', // your App ID
        'clientSecret'  : 'ce9ef7532aa6251345808ef71cae84dd', // your App Secret
        'callbackURL'   : 'http://10.22.187.83:8080/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },
    'googleAuth' : {
        'clientID'      : '559979724442-e4cl7fssbai3pb009ivrcuhrha88ikh1.apps.googleusercontent.com',
        'clientSecret'  : '3WaasTfJmXxBCsOpErFxqLIm',
        'callbackURL'   : 'http://10.22.187.83:8080/auth/google/callback'
    }

};

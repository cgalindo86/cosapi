var ActiveDirectory = require('activedirectory');
var config = {
    url: 'ldap://Cosapi.local' //,
        // baseDN: 'dc=domain,dc=com'
};
var ad = new ActiveDirectory(config);
var username = 'pruebaco2@cosapi.com.pe';
var password = 'Cosapi2019';
// Authenticate
ad.authenticate(username, password, function(err, auth) {
    if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
    }
    if (auth) {
        console.log('Authenticated!');
    } else {
        console.log('Authentication failed!');
    }
});
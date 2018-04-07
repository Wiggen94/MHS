// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var moment = require('moment');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        name         : String,
        bday         : String,
        phone        : Number,
        email        : String,
        password     : String,
        points       : Number,
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

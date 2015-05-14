'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var AdminSchema = new Schema({
    username: {
        type: String,
        unique: 'testing error message',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        default: ''    
    },
    salt: {
        type: String
    },
    token: {
    	type: String
    }

});

/**
 * Create instance method for hashing a password
 */
AdminSchema.methods.hashPassword = function(password,salt) {
    if (salt && password) {
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
AdminSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password,this.salt);
};

mongoose.model('Admin', AdminSchema);
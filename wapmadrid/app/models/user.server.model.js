'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    image:{
        type: String,
        default: ''
    },
    email:{
        type: String,
        default: ''
    },
    name: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Completa el nombre del centro']
    },
    username: {
        type: String,
        unique: 'testing error message',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'La contraseña debe de ser más larga']
    },
    salt: {
        type: String
    },
    token: {
        type: String
    },
    address: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Completa la dirección del centro']
    },
    telephone: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Completa el número de télefono del centro']
    },
    openingHours: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Completa el horario de atención al público']
    },
    provider: {
        type: String,
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    walkers:[{
        walkerID: {
            type: Schema.ObjectId,
            ref: 'Walker'
        }
    }],
    groups:[{
        groupsID: {
            type: Schema.ObjectId,
            ref: 'Group'
        }
    }],
    route: {
        type: Schema.ObjectId,
        ref: 'Route'
    }
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password,salt) {
    if (salt && password) {
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password,this.salt);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

mongoose.model('User', UserSchema);

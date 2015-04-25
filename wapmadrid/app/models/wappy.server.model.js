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
 * Wappy Schema
 */
var WappySchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name']
    },
    displayName: {
        type: String,
        trim: true
    },
    birthDate: {
        type: Date,
        required: 'Please fill date of brith'
    },
    sex: {
        type: Boolean,
        required: 'Please fill in sex field',
        trim: true
    },
    telephone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: 'testing error message',
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your email'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
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
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    salt: {
        type: String
    },
    token: {
        type: String
    },
    provider: {
        type: String
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    /*FALTA : height, weight, smoker, alcohol, diet, exercise, stats, groups, routes*/
    weight: [{
        value: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        },
        imc: {
            type: Number
        }
    }],
    height: {
        type: Number
    },
    smoker: {
        type: Number
    },
    alcohol: {
        type: Number
    },
    groups: [{
        groupID: {
            type: Schema.ObjectId,
            ref: 'Group'
        }
    }],
    routes: [{
        routeID: {
            type: Schema.ObjectId,
            ref: 'Route'
        }
    }],
    stats: [{
        distance: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        },
        kcal: {
            type: Number
        }
    }],
    diet: [{
        value: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    exercise: [{
        avalue: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

/**
 * Hook a pre save method to hash the password
 */
WappySchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
WappySchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
WappySchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
WappySchema.statics.findUniqueUsername = function(username, suffix, callback) {
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

mongoose.model('Wappy', WappySchema);

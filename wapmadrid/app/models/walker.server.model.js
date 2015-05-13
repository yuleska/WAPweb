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
 * Walker Schema
 */
var WalkerSchema = new Schema({
    profileImage:{
        type: String,
    }
    ,firstName: {
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
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your email'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    address:{
        type: String,
        trim: true
    },
    username: {
        type: String,
        unique: 'Nombre de usuario en uso',
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
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
        },
        routeID: {
            type: Schema.ObjectId,
            ref: 'Route'
        },
        rol: {
            type: String,
            enum: ['captain', 'user'],
            default: 'user'
        },
        accepted: {
            type: Boolean,
            default: false
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
        value: {
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
    },
    friends:[{
        friendID: {
            type: Schema.ObjectId,
            ref: 'Walker'
        },
        state: {
            type: String,
            enum: ['pending', 'request', 'accepted'],
            default: ['pending']
        }
    }]
});


/**
 * Create instance method for hashing a password
 */
WalkerSchema.methods.hashPassword = function(password,salt) {
    if (salt && password) {
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
WalkerSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password,this.salt);
};

/**
 * Find possible not used username
 */
WalkerSchema.statics.findUniqueUsername = function(username, suffix, callback) {
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

mongoose.model('Walker', WalkerSchema);

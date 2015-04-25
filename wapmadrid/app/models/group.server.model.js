'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Group name',
        trim: true
    },
    captain: {
        type: Schema.ObjectId,
        ref: 'Walker'
    },
    memebers: [{
        idMember: {
            type: Schema.ObjectId,
            ref: 'Walker'
        },
        accepted: {
            type: Boolean
        }
    }],
    schedule: {
        type: String
    },
    level: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now
    },
    route: {
        type: Schema.ObjectId,
        ref: 'Route'
    }
});

mongoose.model('Group', GroupSchema);
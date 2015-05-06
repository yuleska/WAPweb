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
    image:{
        type: String
    },
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
    members: [{
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
    },
    messages: [{
        idSender: {
            type: Schema.ObjectId,
            ref: 'Walker'
        },
        date: {
            type: Date,
            default: Date.now
        },
        text: {
            type: String
        }
    }],
});

mongoose.model('Group', GroupSchema);
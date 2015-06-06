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
        type: String,
        default: ''
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
        type: String,
        default: ''
    },
    level: {
        type: Number,
        default: 1
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
            type: String,
        	default: ''
        }
    }],
    stats: [{
        distance: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

mongoose.model('Group', GroupSchema);
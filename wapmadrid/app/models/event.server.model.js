'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Group Schema
 */
var EventSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Event name',
        trim: true
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    date: {
        type: String,
	default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    text: {
            type: String
    }
});

mongoose.model('Event', EventSchema);

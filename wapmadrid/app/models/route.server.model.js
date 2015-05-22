'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Route Schema
 */
var RouteSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Route name',
        trim: true
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'Walker'
    },
    coordinates: [{
        _lat: {
            type: Number,
            default: 0
        },
        _long: {
            type: Number,
            default: 0
        }
    }],
    distance: {
        type: Number,
        default: 0
    },
    imgUrl: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Route', RouteSchema);
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
            type: Number
        },
        _long: {
            type: Number
        }
    }],
    distance: {
        type: Number
    },
    imgUrl: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Route', RouteSchema);
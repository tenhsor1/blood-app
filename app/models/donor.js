'use strict';

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Create the donor schema
var DonorSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true},
    contact_number: {type: String, required: true},
    address: {type: String, required: true},
    blood_type: {type: String, required: true},
    location: {type: [Number], required: true}, // Store [Longitude, Latitude]
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Indexes this schema in 2dsphere format for better proximity searches
DonorSchema.index({location: '2dsphere'});

module.exports = mongoose.model('blood-donor', DonorSchema);
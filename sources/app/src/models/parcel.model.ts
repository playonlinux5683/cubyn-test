import parcelService from "../api/services/parcel.services";

var mongoose = require('./../database');

const parcelSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['classic', 'express']
    },
    weight: Number,
    volume: Number,
    recipient: String,
    address: String,
    city: String,
    zipcode: String,
    price: Number
});


const Parcel = mongoose.model('Parcel', parcelSchema);
module.exports = Parcel;
var mongoose = require('./../database');

const parcelSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ['classic', 'express']
	},
	weight: mongoose.Types.Decimal128,
	volume: mongoose.Types.Decimal128,
	recipient: String,
	address: String,
	city: String,
	zipcode: String
});

const Parcel = mongoose.model('Parcel', parcelSchema);
module.exports = Parcel;
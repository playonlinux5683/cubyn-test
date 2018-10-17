import * as mongoose from 'mongoose';

const host = process.env.MONGO_DB_HOST || "db";
const port = process.env.MONGO_DB_PORT || "27017";

if (process.env.MONGO_DB_USER && process.env.MONGO_DB_PWD) {
	mongoose.connect(`mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@${host}:${port}/cubyn`, { useNewUrlParser: true });
} else {
	mongoose.connect(`mongodb://${host}:${port}/cubyn`, { useNewUrlParser: true });
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error : '));
db.once('open', function () {
	console.log('Connection ok!');
});

module.exports = mongoose;
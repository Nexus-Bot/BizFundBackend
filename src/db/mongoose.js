const mongoose = require('mongoose');

const baseConnectionURL = process.env.MONGODB_BASECONNECTION_URL;
const databaseName = process.env.MONGODB_DATABASE_NAME;

const connectionURL = `${baseConnectionURL}/${databaseName}`;

const connectToDB = async () => {
	await mongoose.connect(connectionURL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
};

module.exports = { connectToDB };

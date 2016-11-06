const mongoose = require('mongoose');

exports.initialize = function({ dbUrl = 'localhost', promise = global.Promise } = {}) {
    mongoose.Promise = promise;

    // FIXME: crashes if unnable to connect to the db
    // http://stackoverflow.com/questions/16226472/mongoose-autoreconnect-option
    // http://mongoosejs.com/docs/connections.html
    mongoose.connect(dbUrl);

    mongoose.connection.on('error', () =>
    	console.error(`Unnable to establish connection with MongoDB. Make sure it's running.`));
}

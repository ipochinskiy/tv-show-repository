const User = require('../schema/user-scheme');

exports.initialize = function ({ crypter }) {
    return {
        createUser: function ({ email, password }) {
            return crypter.encrypt(password)
                .then(hash => {
                    const user = new User({
                        email,
                        password: hash,
                    });
                    return user.save();
                });
        },

        findOne: function ({ id, email, password }) {
            if (id) {
                return User.findById(id).exec();
            } else if (!email || !password) {
                return Promise.resolve(null);
            }

            return User.findOne({ email })
                .then(user => {
                    if (!user) {
                        return Promise.resolve(null);
                    }

                    return crypter.compare(password, user.password)
                        .then(isMatch => Promise.resolve(isMatch ? user : null));
                });
        },
    }
}

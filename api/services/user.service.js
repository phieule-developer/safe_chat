let userModel = require('../models/user.model');

module.exports = {
    getOneById: async (id) => {
        let user = await userModel.findById(id);
        if (user) {
            user.token_verify = "";
            user.password = "";
        }
        return user;
    },
    updateMe: async (id, body) => {
        let user = await userModel.findByIdAndUpdate(id, body, { new: true });
        return user;
    },
    getAll: async (filter) => {
        let user = await userModel.aggregate(filter);
        return user;
    },
}
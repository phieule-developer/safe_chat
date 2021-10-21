const { Types } = require('mongoose');
const friendModel = require('../models/friend.model');
module.exports = {
    create: async (body) => {
        let result = await friendModel.create(body);
        return result;
    },
    getFilter: async (filter) => {
        let result = await friendModel.aggregate(filter);
        return result;
    },
    getOne: async (filter) => {
        let result = await friendModel.findOne(filter);
        return result;
    },
    getOneById: async (id) => {
        let result = await friendModel.findById(id);
        return result;
    },
    update: async (filter, body) => {
        let result = await friendModel.findOneAndUpdate(filter, body, { new: true });
        return result;
    },
    remove: async (filter) => {
        let result = await friendModel.findOneAndRemove(filter);
        return result;
    }
}
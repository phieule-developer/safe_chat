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
    update: async (id, body) => {
        let result = await friendModel.findByIdAndUpdate(id, body, { new: true });
        return result;
    },
    remove: async (id) => {
        let result = await friendModel.findByIdAndRemove(id);
        return result;
    }
}
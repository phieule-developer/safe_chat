const { CONST } = require('../../constants/const');
const { ApiResponse } = require('../../helper/response/Api_Response');
const { getFilters} = require('../services/statistic.service');
const version = 1;


module.exports = {
    getAmountUser: async (req, res) => {
        try {

            let filter = [
                {
                    $group: {
                        _id: {
                            _id: null
                        },
                        amount: { $sum: 1 }
                    }
                },
            ];

            let amount = await getFilters(filter);
            return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, { amount }, version);
        } catch (error) {
            return ApiResponse(res, 400, CONST.MESSAGE.ERROR, {}, version);
        }

    },
}
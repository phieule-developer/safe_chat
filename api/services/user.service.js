let userModel = require('../models/user.model');

module.exports ={
    getOneById:async (id)=>{
        let user = await userModel.findById(id);
        user.token_verify = "";
        user.password = "";
        return user;
    },
    updateMe:async (id,body)=>{
        let user = await userModel.findByIdAndUpdate(id,body);
        return user;
    }
}
const { Types } = require('mongoose');
let conservationModel = require('../models/conversation.model');
module.exports ={
    create:async (body)=>{
        let result = await conservationModel.create(body);
        return result;
    },
    getAll:async (filter)=>{
        let result = await conservationModel.aggregate(filter);
        return result;
    },
    getOneById:async (id) =>{
        let result = await conservationModel.findById(id);
        return result;
    },
    update:async (id,body) =>{
        let result = await conservationModel.findByIdAndUpdate(id,body);
        return result;
    },
    checkExistsConservation:async (sender_id,receiver_id)=>{
        return new Promise(async (resolve,reject)=>{
            let check = await conservationModel.findOne({
                members:{
                    $all:[Types.ObjectId(sender_id),Types.ObjectId(receiver_id)]}
            });

            if(check){
                resolve(check._id);
            }else{
                reject(true);
            }
        })
    }
}
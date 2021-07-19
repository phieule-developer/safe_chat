const { Types } = require('mongoose');
let conservationModel = require('../models/conversation.model');
module.exports ={
    create:async (body)=>{
        let ans = await conservationModel.create(body);
        return ans;
    },
    getAll:async (userId)=>{
        let ans = await conservationModel.aggregate(
            [
                {
                    $match:{
                        status:{$ne:-1},
                        members:{
                            $in:[Types.ObjectId(userId)]
                        }
                    }
                },
                {
                    $sort:{
                        last_update:-1
                    }
                }
            ]
        );
        return ans;
    },
    getOneById:async (id) =>{
        let ans = await conservationModel.findById(id);
        return ans;
    },
    update:async (id,body) =>{
        let ans = await conservationModel.findByIdAndUpdate(id,body);
        return ans;
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
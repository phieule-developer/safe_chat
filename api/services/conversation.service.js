const { Types } = require('mongoose');
const conversationModel = require('../models/conversation.model');
module.exports ={
    create:async (body)=>{
        let result = await conversationModel.create(body);
        return result;
    },
    getAll:async (filter)=>{
        let result = await conversationModel.aggregate(filter);
        return result;
    },
    getOneById:async (id) =>{
        let result = await conversationModel.findById(id);
        return result;
    },
    update:async (id,body) =>{
        let result = await conversationModel.findByIdAndUpdate(id,body);
        return result;
    },
    checkExistsConservationMember:async (sender_id,receiver_id)=>{
        return new Promise(async (resolve,reject)=>{
            let mem = [
                Types.ObjectId(sender_id),
                Types.ObjectId(receiver_id)
            ];
            let mem_reverse =[
                Types.ObjectId(receiver_id),
                Types.ObjectId(sender_id)
            ]
            let check = await conversationModel.aggregate([
                {
                    $match: {
                        type:0,
                        $or:[
                            {
                                members:mem
                            },
                            {
                                members:mem_reverse
                            }
                        ]  
                    }
                }
            ]);
            if(check.length > 0){
                resolve(check[0]._id);
            }else{
                reject(true);
            }
        })
    },
    checkExistsConservationID:async (id)=>{
        return new Promise (async (resolve,reject)=>{
            let check = await conversationModel.findOne({
                _id:id,
                type:1
            });
            if(check){
                resolve(check._id)
            }else{
                reject(true);
            }
        })
    }
}
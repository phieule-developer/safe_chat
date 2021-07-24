const { Types } = require('mongoose');
const conversationModel = require('../models/conversation.model');
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
    }
}
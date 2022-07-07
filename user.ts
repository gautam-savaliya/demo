import moment from 'moment';
import db from "./models";
const User = db["User"];

async function formatMsg(data:any){
    let user = await User.findOne({
        where: {
          id: data.senderId || data.userId,
        },
      });
      if(user){
        const newData = {
            groupId: data.groupId || data.room,
            senderId:data.senderId || data.userId,
            senderName:user.dataValues.fullname,
            receiverId:data.receiverId,
            message:data.message ,
            time: moment().format('h:mm a')
          }
          return newData

      }

}



module.exports = formatMsg;


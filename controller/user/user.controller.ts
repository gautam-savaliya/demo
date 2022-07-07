import db from "../../models";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import * as dotenv from "dotenv";
import sendMail from "../../helper/sendMail";


import crypto from 'crypto';
import moment from 'moment';
import Sequelize from "sequelize";
var _ = require('lodash');

const Op = Sequelize.Op;
dotenv.config({ path: __dirname + "/.env" });
const { Socket } = require("../../socket.service");

const User = db["User"];
const Friend = db["Friend"];
const chat_history = db["chat_history"];
const clear_chat = db["clear_chat"];


export class UserController {
  static async register(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      let data = req.body;
      if (!data) {
        throw new Error("Please fill all the required fields");
      }
      data.imageName = req.file.originalname
      let existingEmail = await User.findOne({
        where: {
          number: data.number,
        },
      });
      if (existingEmail) {
        throw new Error("User already exists");
      }

      let hasedPassword = await bcrypt.hash(data.password, 10);
      let result = await User.create({
        fullname: data.fullname,
        number: data.number,
        email: data.email,
        password: hasedPassword,
        imageName: data.imageName,

      });
      res.send(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req: any, res: any, next: any) {
    try {
      let { number, password } = req.body;

      if (!(number && password)) {
        throw new Error("Please enter User Name and password");
      }

      let userExists: any = await User.findOne({
        where: {
          number: number,
        },
      });
      if (!userExists) {
        throw new Error("User does not exists");
      }

      let checkPassword = await bcrypt.compare(password, userExists.password);

      let secret: any = process.env.SECRET;

      if (!checkPassword) {
        throw new Error("Incorrect credentials");
      } else {
        let token = jsonwebtoken.sign({ id: userExists.id }, secret, {
          expiresIn: "1h",
        });
        res.send({
          token: token,
          fullname: userExists.fullname,
          userId: userExists.id,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUser(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const users = await User.findAll({

      });

      res.send(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async searchUser(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const search = req.body.name;
      const users = await User.findAll({
        where: {
          [Op.or]: {
            fullname: {
              [Op.like]: "%" + search + "%"
            },
            number: {
              [Op.like]: "%" + search + "%"
            }
          }
        },

      })
      res.send(users);

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async requsetSingleUser(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const data = req.body;
      let existingUser = await Friend.findOne({
        where: {
          receiverId: data.receiverId,
          senderId: data.senderId,
        },
      })
      if (existingUser) {
        res.send({ message: 'you alreay Sent The Request' });

      } else {
        let result = await Friend.create({
          receiverId: data.receiverId,
          senderId: data.senderId,
          isFriend: false,
        });
        if (result) {
          const reciverUser = await User.findOne({
            where: {
              id: result.dataValues.receiverId
            },
          });
          if (reciverUser) {
            result.dataValues.receiverName = reciverUser.fullname
          }
          const senderUser = await User.findOne({
            where: {
              id: result.dataValues.senderId
            },
          });
          if (senderUser) {
            result.dataValues.senderName = senderUser.fullname
          }
        }
        Socket.emitData('requset-single-list', result)

        res.send(result);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async requsetFriendList(req: any, res: any, next: any) {
    try {
      const data = req.body
      //Validation for all the required fields
      const users = await Friend.findAll({
        where: {
          receiverId: data.receiverId,
          isFriend: false

        },
      });
      for (const item of users) {
        const senderUser = await User.findOne({
          where: {
            id: item.senderId
          },
        });
        if (senderUser) {
          item.dataValues.senderName = senderUser.fullname
        }

      }
      res.send(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async acceptRequset(req: any, res: any, next: any) {
    try {
      const data = req.body;
      //Validation for all the required fields
      if (data) {
        const user = await Friend.findOne({
          where: {
            id: data.id,
            isFriend: false
          },
        });
        if (user) {
          let updateRequset = await Friend.update({
            isFriend: true
          }, {
            where: {
              id: data.id
            }
          })
          let result = await Friend.create({
            senderId: data.receiverId,
            receiverId: data.senderId,
            isFriend: true,

          });
          const reciverUser = await User.findOne({
            where: {
              id: user.dataValues.receiverId
            },
          });
          if (reciverUser) {
            user.dataValues.receiverName = reciverUser.fullname
          }
          const senderUser = await User.findOne({
            where: {
              id: user.dataValues.senderId
            },
          });
          if (senderUser) {
            user.dataValues.senderName = senderUser.fullname
          }
          const reqreciverUser = await User.findOne({
            where: {
              id: result.dataValues.receiverId
            },
          });
          if (reqreciverUser) {
            result.dataValues.receiverName = reqreciverUser.fullname
          }
          const reqsenderUser = await User.findOne({
            where: {
              id: result.dataValues.senderId
            },
          });
          if (reqsenderUser) {
            result.dataValues.senderName = reqsenderUser.fullname
          }
          user.dataValues.isFriend = true
          Socket.emitData('requset-aceept', result)

          // setTimeout(() => {

          // }, 100);
          const activeUser = Socket.getActiveUser()
          setTimeout(() => {
            Socket.emitData('requset-list', user)

          }, 1000);
          setTimeout(() => {
            Socket.emitData('onIsActive', activeUser)

          }, 1500);

          res.send({ status: 'success' });
        }


      }


    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async friendList(req: any, res: any, next: any) {
    try {
      const data = req.body
      //Validation for all the required fields
      let users = await Friend.findAll({
        where: {
          senderId: data.senderId,
          isFriend: true

        },

      });
      users = JSON.parse(JSON.stringify(users))
      const lastMsgs = []
      const newUser = [];

      for (const item of users) {
        const reciverUser = await User.findOne({
          where: {
            id: item.receiverId
          },
        });
        if (reciverUser) {
          item.senderName = reciverUser.fullname
        }
        const clear_history = await clear_chat.findOne({
          where: {
            senderId: item.senderId,
            receiverId: item.receiverId
          },
          order: [
            ['createdAt', 'DESC'],
          ],
        })
        const filter:any = {
          senderId: {
            [Sequelize.Op.in]: [item.senderId, item.receiverId]
          },
          receiverId: {
            [Sequelize.Op.in]: [item.senderId, item.receiverId]
          }
        }
        if(clear_history){
           filter.createdAt={
              [Op.gte]:clear_history.createdAt
            }            
        }
        const lastMsg = await chat_history.findOne({
          where: filter,
          order: [
            ['createdAt', 'DESC'],
          ],
        });
        if (lastMsg) {
          lastMsgs.push(JSON.parse(JSON.stringify(lastMsg)));

        } else {
          item.msgCount = 0;
          newUser.push(item);

        }
      }
      // lastMsgs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      lastMsgs.sort(function compare(a, b) {
        var dateA: any = new Date(a.createdAt)
        var dateB: any = new Date(b.createdAt)
        return dateB - dateA;
      });
      for (const item of lastMsgs) {
        if (item) {
          const obj: any = {}
          obj.senderId = item.senderId
          obj.receiverId = item.receiverId
          const user = _.find(users, (res:any)=>{
            return ((res.senderId === item.senderId || res.senderId===item.receiverId)&& (res.receiverId === item.senderId || res.receiverId===item.receiverId));

          })
          if (user) {
            // console.log('useruser', user)
            user.letestMsg = item.message
            user.msgTime = item.createdAt;
            user.msgCount = 0;
            const count = await chat_history.findAndCountAll ({
              where:{
                senderId:user.receiverId,
                receiverId:user.senderId,
                isMsgRead:false
              }
            })
            console.log('count', count);
            if(count){
              user.msgCount = count.count 
            }else{
              user.msgCount = 0;
            }

            newUser.push(user);
          }
        }


      }
      res.send(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async forgotPassword(req: any, res: any, next: any) {
    try {
      let { email } = req.body;

      let user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user)
        return res
          .status(401)
          .json({
            message:
              "The email address " +
              req.body.email +
              " is not associated with any account. Double-check your email address and try again.",
          });

      let resetPasswordToken = crypto.randomBytes(20).toString('hex');
      let resetPasswordExpire = Date.now() + 360000;

      let result = await User.update({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: resetPasswordExpire
      }, {
        where: {
          email: email
        }
      });
      sendMail(email, resetPasswordToken);

      res.send({
        "message": "Email has been send",
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async resetPassword(req: any, res: any, next: any) {
    try {
      let { token, password, email } = req.body;

      let user = await User.findOne({
        where: {
          email: email
        }
      })

      let currentDate = moment().format('DD/MM/YYYY H:mm:ss')

      let expiryDate = moment(user.resetPasswordExpire).format('DD/MM/YYYY H:mm:ss')

      let hasedPassword = await bcrypt.hash(password, 12);


      if (token === user.resetPasswordToken && currentDate <= expiryDate) {
        let updatePassword = await User.update({
          password: hasedPassword
        }, {
          where: {
            email: email
          }
        })
        res.status(500).json({
          message: "Your password has been changed please login to continue"
        });
      }
      else if (expiryDate < currentDate) {
        throw new Error('The token you enter is expired')
      }
      else {
        throw new Error('Wrong token, Please check the token again')
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

}






import db from "../../models";
import * as dotenv from "dotenv";
import moment from 'moment';
const { Socket } = require("../../socket.service");
import Sequelize from "sequelize";
import e from "express";
const Op = Sequelize.Op;
dotenv.config({ path: __dirname + "/.env" });
var _ = require('lodash');
const { LocalStorage } = require("node-localstorage");

const Friend = db["Friend"];
const Group = db["Group"];
const GroupUsers = db["GroupUsers"];
const chat_history = db["chat_history"];
const User = db["User"];
const clear_chat = db["clear_chat"];


export class GroupController {
  static async addGroup(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      let data = req.body;
      if (!data) {
        throw new Error("Please fill all the required fields");
      }
      let existingGroup = await Group.findOne({
        where: {
          groupName: data.groupName
        },
      });
      if (existingGroup) {
        throw new Error("Group Name already exists");
      }
      let result = await Group.create({
        groupName: data.groupName,
        status: Number(data.status),
      });
      if (result) {
        let results = await GroupUsers.create({
          groupId: result.dataValues.id,
          userId: data.userId,
          role: 'admin',
          isRequest: true,
        });
      }

      res.send(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async GroupList(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const group = await Group.findAll({
        where: {
          status: 1,
        },
      });
      Socket.emitData('group-list', group)
      res.send(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  static async addUserInGroup(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      let data = req.body;
      if (!data) {
        throw new Error("Please fill all the required fields");
      }
      const results = []
      for (const item of data.selectedFrd) {
        let existingUser = await GroupUsers.findOne({
          where: {
            groupId: data.groupId,
            userId: Number(item),
          },
        })
        if (existingUser) {
        } else {
          let result = await GroupUsers.create({
            groupId: data.groupId,
            userId: Number(item),
            role: 'user',
            isRequest: true,
          });
          if (result) {
            const group = await Group.findOne({
              where: {
                id: result.dataValues.groupId
              },
            });
            if (group) {
              result.dataValues.groupName = group.groupName
            }
          }
          Socket.emitData('requset-list', result)
          results.push(result);

        }
      }
      if (results && results.length > 0) {
        res.send({ status: results });

      } else {
        res.send({ status: [] });

      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async leaveGroup(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      let data = req.body;
      if (!data) {
        throw new Error("Please fill all the required fields");
      }

     const result = await GroupUsers.destroy({ where: { id: data.id } });
     console.log('result', result);
     if(result==1){
      res.send({message:'You leave this group'})
     }else{
      res.send({message:'You are unable to leave'})
     }


    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  static async requstGrouopList(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      let groups = await GroupUsers.findAll({
        where: {
          userId: req.body.userId
        },
      });
      if (groups && groups.length > 0) {
        groups = JSON.parse(JSON.stringify(groups))
        const lastMsgs = []
        const newData = [];

        for (const item of groups) {
          const group = await Group.findOne({
            where: {
              id: item.groupId
            },
          });
          if (group) {
            item.groupName = group.groupName
          }
          const clear_history = await clear_chat.findOne({
            where: {
              groupId: item.groupId,
              senderId: req.body.userId
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          })
          const filter: any = {
            groupId: item.groupId
          }
          if (clear_history) {
            filter.createdAt = {
              [Op.gte]: clear_history.createdAt
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
            newData.push(item);

          }
          // newData.push(item)
        }
        for (const item of lastMsgs) {
          const obj: any = {}
          obj.groupId = item.groupId
          const user = _.find(groups, obj)
          if (user) {
            user.letestMsg = item.message
            user.msgTime = item.createdAt;

            newData.push(user);
          }

        }

        res.send(newData);

      } else {
        res.send([]);

      }


    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }




  static async groupUser(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const id = req.params;
      if (id) {
        const group = await GroupUsers.findAll({
          where: {
            groupId: id.id,
            // user: req.body.user
          },
        });
        if (group && group.length > 0) {
          for (const item of group) {
            const user = await User.findOne({
              where: {
                id: item.dataValues.userId
              },
            });
            if (user) {
              item.dataValues.userName = user.fullname
            }
          }
        }
        res.send(group);

      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async clearChat(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const data = req.body
      console.log('data', data);
      if (data) {
        let lastMsg: any = {};
        if (data.groupId) {
          lastMsg = await chat_history.findOne({
            where: {
              groupId: data.groupId
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          });
        } else {
          lastMsg = await chat_history.findOne({
            where: {
              senderId: {
                [Sequelize.Op.in]: [data.senderId, data.receiverId]
              },
              receiverId: {
                [Sequelize.Op.in]: [data.senderId, data.receiverId]
              }
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          });
        }

        lastMsg = JSON.parse(JSON.stringify(lastMsg));
        if (lastMsg) {
          const result = await clear_chat.create({
            lastMsgId: lastMsg.id,
            groupId: lastMsg.groupId,
            lastMsengerId: lastMsg.senderId,
            senderId: Number(data.senderId) || Number(data.userId),
            receiverId: (data.receiverId) ? data.receiverId : null
          })
          res.send(result);

        }
      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async chatHistory(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const data = req.body
      console.log('data', data)
      if (data) {
        if (data.groupId) {
          const clear_history = await clear_chat.findOne({
            where: {
              groupId: data.groupId,
              senderId: data.userId
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          })
          const filter: any = {
            groupId: data.groupId
          }
          if (clear_history) {
            filter.createdAt = {
              [Op.gte]: clear_history.createdAt
            }
          }
          const chatHistory: any = await chat_history.findAll({

            where: filter
          });
          for (const item of chatHistory) {
            const user = await User.findOne({
              where: {
                id: item.dataValues.senderId
              },
            });
            if (user) {
              item.dataValues.senderName = user.fullname
            }
          }

          res.send(chatHistory);
        } else {

          let allMsg = await chat_history.findAll({
            where: {
              senderId: data.receiverId,
              receiverId: data.senderId,
              isMsgRead: false
            }
          })
          if (allMsg) {
            allMsg = JSON.parse(JSON.stringify(allMsg))
          }
          for (const item of allMsg) {
            let updateRequset = await chat_history.update({
              isMsgRead: true
            }, {
              where: {
                id: item.id
              }
            })
            if (updateRequset && updateRequset[0] == 1) {
              var localStorage = new LocalStorage('./scratch');
              let joinUser: any = localStorage.getItem('joinUser');
              if (joinUser) {
                joinUser = JSON.parse(joinUser)
                var senderUser = joinUser.find(function (o: any) {
                  return (o.userId == data.receiverId);
                });
                if (senderUser) {
                  item.socketId = senderUser.id
                  Socket.emit('send-msg-seen', item, senderUser.id);
                }

              }
            }
          }
          const clear_history = await clear_chat.findOne({
            where: {
              senderId: data.senderId,
              receiverId: data.receiverId
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          })
          console.log(JSON.parse(JSON.stringify(clear_history)))
          const filter: any = {
            senderId: {
              [Sequelize.Op.in]: [data.senderId, data.receiverId]
            },
            receiverId: {
              [Sequelize.Op.in]: [data.senderId, data.receiverId]
            }
          }
          if (clear_history) {
            filter.createdAt = {
              [Op.gte]: clear_history.createdAt
            }
          }
          const chatHistory = await chat_history.findAll({

            where: filter
          });
          res.send(chatHistory);
        }


      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async checkGroupUser(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      const data = req.body;
      if (req.body) {
        const group = await GroupUsers.findAll({
          where: {
            groupId: data.groupId,
            role: 'user'
          },
        });
        // res.send(group);
        if (group && group.length > 0) {
          const friends = [];
          const usersId = [];
          for (const item of group) {
            usersId.push(item.dataValues.userId);
          }

          const users = await Friend.findAll({
            where: {
              [Op.and]: {
                senderId: data.userId,
                receiverId: {
                  [Sequelize.Op.notIn]: usersId
                }
              },
              isFriend: true


            },

          });
          if (users && users.length > 0) {
            for (const item of users) {
              const reciverUser = await User.findOne({
                where: {
                  id: item.receiverId
                },
              });
              if (reciverUser) {
                item.dataValues.senderName = reciverUser.fullname
              }

            }
          }

          res.send(users);


        } else {
          const users = await Friend.findAll({
            where: {
              senderId: data.userId,
              isFriend: true

            },

          });
          if (users && users.length > 0) {
            for (const item of users) {
              const reciverUser = await User.findOne({
                where: {
                  id: item.receiverId
                },
              });
              if (reciverUser) {
                item.dataValues.senderName = reciverUser.fullname
              }

            }
          }

          res.send(users);
        }
      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  static async uploadsImges(req: any, res: any, next: any) {
    try {
      //Validation for all the required fields
      if (req.files && req.files.length > 0) {
        let imageName: any = [];
        for (const item of req.files) {
          imageName.push(item.originalname);
        }
        res.send({ imageName: imageName });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}







const server = require('http').createServer();
// const { userJoin, getcurrentUser } = require('./user')
const { LocalStorage } = require("node-localstorage");
import moment from 'moment';

var _ = require('lodash');
var msgData = []
const formate = require('./user')
import db from "./models";
const Group = db["Group"];
const chat_history = db["chat_history"];

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on('connection', (socket: any) => {
  console.log('user connected...!!!!')



  socket.on('create-group', async function (data: any, callback: any) {
    //joining
    const user = userJoin(socket.id, Number(data.userId), data.room)

    socket.join(data.room);

    console.log(data.userId + 'Crete this Group : ' + data.room);
    data.message = `${data.userName} create this Group.`
    const formateData = await formate(data);
    formateData.role = 'admin'
    io.in(data.room).emit('new-user-joined', formateData);
    //Validation for all the required fields
    if (data) {
      let result = await chat_history.create({
        groupId: data.room,
        senderId: data.userId,
        message: `${data.userName} create this Group.`,
        time: formateData.time,
        role: 'admin'

      });

    }
  });

  socket.on('join', async function (data: any, callback: any) {
    //joining
    const user = userJoin(socket.id, Number(data.userId), data.room)

    socket.join(data.room);

    console.log(data.userId + 'joined this Group : ' + data.room);
    const formateData = await formate(data);
    formateData.message = `${data.userName} added ${formateData.senderName} in this group.`
    formateData.role = 'admin'
    const groupUser = getGroupUser(formateData)
    if (groupUser) {
      for (const item of groupUser) {
        io.to(item.id).emit('new-user-joined', formateData);

      }

    }
    // socket.broadcast.to(data.room).emit('new-user-joined', formateData);
    //Validation for all the required fields
    if (data) {
      let result = await chat_history.create({
        groupId: data.room,
        senderId: data.userId,
        message: formateData.message,
        time: formateData.time,
        role: 'admin'

      });

    }
  });

  socket.on('userData', function (data: any) {
    // console.log(data.user + 'left the room : ' + data.room);

    // io.sockets.in(data.room).emit('left room', { user: data.user, message: 'has left this room.' });
    const user = userJoin(socket.id, Number(data.userId))

    const activeUsers = getActiveUser()
    io.emit('onIsActive', activeUsers);

  });


  socket.on('leave', async function (data: any) {
    console.log(data.userId + 'left the room : ' + data.room);

    const formateData = await formate(data);
    if(data.role=='admin'){
      formateData.message = `${data.adminName} remove ${data.userName} in this group.`
      const user = findUser(data.userId);
      if(user){
        console.log('user', user);
        io.to(user.id).emit('remove-room', {groupId:data.room})
      }
    }else{
      formateData.message = `${data.userName} leave this group.`

    }
    formateData.role = 'admin'
    const groupUser = getGroupUser(formateData)
    if (groupUser && groupUser.length > 0) {
      for (const item of groupUser) {
        io.to(item.id).emit('left room', formateData);

      }
    }
    const user = userLeve(socket.id, Number(data.userId), data.room)
    socket.leave(data.room);
    let result = await chat_history.create({
      groupId: data.room,
      senderId: data.userId,
      message: formateData.message,
      time: formateData.time,
      role: 'admin'

    });
  });

  socket.on('message', async function (data: any) {
    // const user = getcurrentUser.getCurrentUser(socket.id)
    let newData: any = { senderId: data.senderId, receiverId: data.receiverId, message: data.message }
    if (data.room) {
      newData.groupId = data.room
      const groupUser = getGroupUser(newData)
      if (groupUser) {
        for (const item of groupUser) {

          if (data.fileName) {
            const formateData = await formate(newData)
            formateData.fileName = data.fileName

            io.to(item.id).emit('new message', formateData);

          } else {
            const formateData = await formate(newData)

            io.to(item.id).emit('new message', formateData);

          }

        }
      }
    } else {
      var localStorage = new LocalStorage('./scratch');

      let joinUser: any = localStorage.getItem('joinUser');
      if (joinUser) {
        joinUser = JSON.parse(joinUser)
        var receiverUser = joinUser.find(function (o: any) {
          return (o.userId == newData.receiverId);
        });
        var senderUser = joinUser.find(function (o: any) {
          return (o.userId == newData.senderId);
        });
        newData.time = moment().format('h:mm a')
        if (receiverUser) {
          if (data.fileName) {
            newData.fileName = data.fileName

          }
          io.to(receiverUser.id).emit("new message", newData)
        }
        if (senderUser) {
          if (data.fileName) {
            newData.fileName = data.fileName
          }
          io.to(senderUser.id).emit("new message", newData)
        }
      }


    }

    let result = await chat_history.create({
      groupId: data.room,
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      time: moment().format('h:mm a'),
      fileName: JSON.stringify(data.fileName),
      isMsgRead: false


    });

  })

  socket.on('sendEvent', async function (data: any) {
    // const user = getcurrentUser.getCurrentUser(socket.id)
    let newData: any = { senderId: data.senderId, receiverId: data.receiverId, message: data.message }
    if (data.room) {
      newData.groupId = data.room

      const formateData = await formate(newData)
      // socket.broadcast.to(data.room).emit('typeMessage', formateData);
      const groupUser = getGroupUser(formateData)
      if (groupUser) {
        for (const item of groupUser) {
          if (formateData.senderId !== item.userId) {
            io.in(item.id).emit('typeMessage', formateData);

          }

        }

      }
      // io.in(data.room).emit('new message', formateData);
    } else {
      var localStorage = new LocalStorage('./scratch');

      let joinUser: any = localStorage.getItem('joinUser');
      if (joinUser) {
        joinUser = JSON.parse(joinUser)
        var receiverUser = joinUser.find(function (o: any) {
          return (o.userId == newData.receiverId);
        });

        if (receiverUser) {
          if (data.fileName) {
            newData.fileName = data.fileName

          }
          io.to(receiverUser.id).emit("typeMessage", newData)
        }

      }


    }


  })

  socket.on('send-msg-status', async function (data: any) {
    console.log('data', data);
    // const user = getcurrentUser.getCurrentUser(socket.id)
    var localStorage = new LocalStorage('./scratch');
    let joinUser: any = localStorage.getItem('joinUser');
    if (joinUser) {
      joinUser = JSON.parse(joinUser)
      var senderUser = joinUser.find(function (o: any) {
        return (o.userId == data.senderId);
      });

      if (senderUser) {
        if (data.fileName) {
          data.fileName = data.fileName

        }
        setTimeout(async () => {
          let lastMsg = await chat_history.findOne({
            where: {
              senderId: data.senderId,
              receiverId: data.receiverId,
              time: data.time
            },
            order: [
              ['createdAt', 'DESC'],
            ],
          });
          lastMsg = JSON.parse(JSON.stringify(lastMsg))
          console.log('lastMsg', lastMsg);
          if (lastMsg) {
            let updateRequset = await chat_history.update({
              isMsgRead: true
            }, {
              where: {
                id: lastMsg.id
              }
            })
            if (updateRequset && updateRequset[0] == 1) {
              io.to(senderUser.id).emit("send-msg-seen", data)

            }
          }

        }, 100);


      }

    }

  })

  socket.on('disconnect', function () {
    var localStorage = new LocalStorage('./scratch');
    let joinUser: any = localStorage.getItem('joinUser');
    if (joinUser) {
      const disconnectUsr = JSON.parse(joinUser)
      const index = disconnectUsr.findIndex((item: any) => item.id === socket.id);
      if (index > -1) {
        disconnectUsr[index].isActive = false;
        io.emit('onIsActive', disconnectUsr);
        localStorage.setItem('joinUser', JSON.stringify(disconnectUsr));

      }

    }
  });
});
io.on('connect_error', function (err: any) {
  console.log('this is error-- ' + err.message);
});
server.listen(3000);


const Socket = {
  emit: function (event: any, data: any, socketId: any) {

    io.to(socketId).emit(event, data);
  },

  emitData: function (event: any, data: any) {

    io.emit(event, data);
  },
  getActiveUser: function () {
    // users.push(user)
    var localStorage = new LocalStorage('./scratch');

    let joinUser: any = localStorage.getItem('joinUser');
    if (joinUser) {
      let activeUser = [];
      joinUser = JSON.parse(joinUser)
      for (const item of joinUser) {
        if (item.isActive == true) {
          activeUser.push(item)
        }
      }
      return activeUser;

    }


  }
}

function userJoin(id: any, userId: any, room?: any) {
  const user: any = { id, userId }
  user.isActive = true;
  var localStorage = new LocalStorage('./scratch');

  let joinUser: any = localStorage.getItem('joinUser');
  if (joinUser) {
    joinUser = JSON.parse(joinUser)
    var records = joinUser.find(function (o: any) {
      return (o.userId == user.userId);
    });
    if (records) {
      const newConnection = [];
      if (room) {
        for (const item of joinUser) {
          if (records.userId == item.userId) {

            if (item.groupIds && item.groupIds.length > 0) {
              item.groupIds.push(room)
            } else {
              item.groupIds = [room]
            }
          }
          newConnection.push(item);
        }
      } else {
        for (const item of joinUser) {
          if (records.userId == item.userId) {
            item.id = user.id
            item.isActive = true
          }
          newConnection.push(item);
        }

      }
      if (newConnection.length > 0) {
        localStorage.setItem('joinUser', JSON.stringify(newConnection));

      }

    } else {
      joinUser.push(user)
      localStorage.setItem('joinUser', JSON.stringify(joinUser));
    }

  } else {
    localStorage.setItem('joinUser', JSON.stringify([user]));

  }
  return user;
}

function userLeve(id: any, userId: any, room: any) {
  console.log(id, userId, room)
  var localStorage = new LocalStorage('./scratch');

  let joinUser: any = localStorage.getItem('joinUser');
  if (joinUser) {
    joinUser = JSON.parse(joinUser)
    const obj: any = {}
    obj.userId = userId
    const index = _.findIndex(joinUser, obj);
    if (index>-1) {

      const groupIndex = joinUser[index].groupIds.indexOf(room)

      if (groupIndex>-1) {
        joinUser[index].groupIds.splice(groupIndex, 1);
        localStorage.setItem('joinUser', JSON.stringify(joinUser));

      }
    }
  }

}
function getActiveUser() {
  // users.push(user)
  var localStorage = new LocalStorage('./scratch');

  let joinUser: any = localStorage.getItem('joinUser');
  if (joinUser) {
    let activeUser = [];
    joinUser = JSON.parse(joinUser)
    for (const item of joinUser) {
      if (item.isActive == true) {
        activeUser.push(item)
      }
    }
    return activeUser;

  }


}

function getGroupUser(data: any) {
  // users.push(user)
  var localStorage = new LocalStorage('./scratch');

  let joinUser: any = localStorage.getItem('joinUser');
  if (joinUser) {
    joinUser = JSON.parse(joinUser)

    let groupUser = _.filter(
      joinUser,
      _.flow(
        _.property('groupIds'),
        _.partial(_.intersection, [data.groupId]),
        _.size,
      ),
    );
    return groupUser;

  }


}

function findUser(userId: any){
  var localStorage = new LocalStorage('./scratch');

  let joinUser: any = localStorage.getItem('joinUser');
  if (joinUser) {
    joinUser = JSON.parse(joinUser)
    const obj:any = {};
    obj.userId = Number(userId)
    let user = _.find(joinUser, obj)
    console.log('usersssssss', user);
    return user;
  }
}


exports.Socket = Socket;
exports.io = io;

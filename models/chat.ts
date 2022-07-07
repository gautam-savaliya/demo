'use strict';
import {
  Model
}  from 'sequelize';

interface ChatHistoryAttributes {
  groupId: number;
  senderId: number;
  receiverId: number;
  message:string;
  time:string;
  fileName:string;
  role:string;
  isMsgRead:boolean;
}

module.exports = (sequelize:any, DataTypes:any) => {
  class chat_history extends Model <ChatHistoryAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
      // Friend.belongsTo(models.User, { foreignKey: "userId" , as: "senderId"});
			// Friend.belongsTo(models.User, { foreignKey: "userId", as: "receiverId" });
    }
  };
  chat_history.init({
    groupId:{
      type:DataTypes.INTEGER,
      allowNull: true,
  },
    senderId: {
			type: DataTypes.INTEGER,
      allowNull: true,
		},
    receiverId: {
			type: DataTypes.INTEGER,
      allowNull: true,
		}, 
    message: {
			type: DataTypes.STRING,
      allowNull: true,
		}, 
    time: {
			type: DataTypes.STRING,
      allowNull: true,
		}, 
    fileName: {
			type: DataTypes.TEXT('long'),
      allowNull: true,
		}, 
    role: {
			type: DataTypes.STRING,
      allowNull: true,
		}, 
    isMsgRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    }
 
   
  }, {
    sequelize,
    modelName: 'chat_history',
  });
  return chat_history;
};
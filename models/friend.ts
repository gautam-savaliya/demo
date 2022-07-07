'use strict';
import {
  Model
}  from 'sequelize';

interface FriendAttributes {
  senderId: number;
  receiverId: number;
  isFriend: boolean
}

module.exports = (sequelize:any, DataTypes:any) => {
  class Friend extends Model <FriendAttributes> {
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
  Friend.init({
    senderId: {
			type: DataTypes.INTEGER,
			// references: {
			// 	model: "User",
			// 	key: "id"
			// }
		},
    receiverId: {
			type: DataTypes.INTEGER,
			// references: {
			// 	model: "User",
			// 	key: "id"
			// }
		}, 
    isFriend:{
        type:DataTypes.BOOLEAN,
        allowNull: true,
    },
   
  }, {
    sequelize,
    modelName: 'Friend',
  });
  return Friend;
};
'use strict';
import {
    Model
} from 'sequelize';

interface ClearChatAttributes {
    groupId: number;
    senderId: number;
    receiverId: number;
    lastMsgId: number;
    lastMsengerId: number;


}

module.exports = (sequelize: any, DataTypes: any) => {
    class clear_chat extends Model<ClearChatAttributes> {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
            // Friend.belongsTo(models.User, { foreignKey: "userId" , as: "senderId"});
            // Friend.belongsTo(models.User, { foreignKey: "userId", as: "receiverId" });
        }
    };
    clear_chat.init({
        groupId: {
            type: DataTypes.INTEGER,
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
        lastMsgId:{
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
        lastMsengerId:{
            type: DataTypes.INTEGER,
            allowNull: true, 
        }

    }, {
        sequelize,
        modelName: 'clear_chat',
    });
    return clear_chat;
};
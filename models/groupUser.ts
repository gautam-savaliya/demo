'use strict';
import {
  Model
}  from 'sequelize';

interface GroupUsersAttributes {
  groupId:number,
  userId:string,
  role:string,
  isRequest:boolean
}

module.exports = (sequelize:any, DataTypes:any) => {
  class GroupUsers extends Model <GroupUsersAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
    }
  };
  GroupUsers.init({
    groupId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId:{
      type:DataTypes.STRING,
      allowNull: false,
    },
    role:{
      type:DataTypes.STRING,
      allowNull: false,
    },
    isRequest:{
      type:DataTypes.BOOLEAN,
      allowNull: false,
    }

  }, {
    sequelize,
    modelName: 'GroupUsers',
  });
  return GroupUsers;
};
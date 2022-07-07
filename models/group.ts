'use strict';
import {
  Model
}  from 'sequelize';

interface GroupAttributes {
  groupName: string;
  status: number;

}

module.exports = (sequelize:any, DataTypes:any) => {
  class Group extends Model <GroupAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
    }
  };
  Group.init({
    groupName:{
      type: DataTypes.STRING,
      allowNull: false
    },
    status:{
      type:DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
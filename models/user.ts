'use strict';
import {
  Model
}  from 'sequelize';

interface UserAttributes {
  fullname: string;
  email: string;
  password: string;
  number:number;
  imageName:string;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
}

module.exports = (sequelize:any, DataTypes:any) => {
  class User extends Model <UserAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models:any) {
      // define association here
      // User.hasMany(models.Friend, { foreignKey: "userId" });
      // User.hasMany(models.Friend, { foreignKey: "userId" as 'receiverId'});
    }
  };
  User.init({
    fullname:{
      type: DataTypes.STRING,
      allowNull: false
    },
    email:{
      type:DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number:{
      type: DataTypes.STRING,
      allowNull: false
    },
    imageName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpire:{
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DBUSERNAME,
    "password":  process.env.DBPASSWORD,
    "database":  process.env.DBNAME,
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

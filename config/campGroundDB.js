const mysql=require("mysql");

var connection=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'12345678',
    database:'campGround'
});

module.exports=connection;
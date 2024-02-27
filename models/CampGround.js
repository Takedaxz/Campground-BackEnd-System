const sql=require('../config/campGroundDB');

const CampGround=function(campGround){
    this.id=campGround.id;
    this.name=campGround.name;
    this.tel=campGround.tel;
};

CampGround.getAll=result=>{
    sql.query("SELECT * FROM campgrounds;",(err,res)=>{
        if(err){
            console.log("error: ",err);
            result(er,null);
            return;
        }

        console.log("campGrounds: ",res);
        result(null,res);
    });
};

module.exports=CampGround;
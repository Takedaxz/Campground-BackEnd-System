const mongoose = require('mongoose');

const CampSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add a name'],
        unique: true,
        trim: true,
        maxlength:[50,'Name cannot be more than 50 characters']
    },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    tel:{
        type:String,
        required:[true,'Please add telephone number']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Reverse populate with virtuals
CampSchema.virtual('appointments',{
    ref:'Appointment',
    localField:'_id',
    foreignField:'camp',
    justOne:false
});

//Cascade delete appointments when a camp is deleted
CampSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Appointments being removed from camp ${this._id}`);
    await this.model('Appointment').deleteMany({camp:this._id});
    next();
});

module.exports=mongoose.model('Camp',CampSchema);
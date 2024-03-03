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
        required:[true,'Please add telephone number'],
        maxlength : 10
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Reverse populate with virtuals
CampSchema.virtual('reservations',{
    ref:'Reservation',
    localField:'_id',
    foreignField:'camp',
    justOne:false
});

//Cascade delete reservations when a camp is deleted
CampSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Reservations being removed from camp ${this._id}`);
    await this.model('Reservation').deleteMany({camp:this._id});
    next();
});

module.exports=mongoose.model('Camp',CampSchema);
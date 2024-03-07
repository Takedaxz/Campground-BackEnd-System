const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name'],
        unique : true,
        maxlength: [50,'Name cannot be more than 50 characters']
    },
    address: {
        type:String,
        required: [true,'Please add an address']
    },
    tel: {
        type:String,
        required: [true,'Please add telephone number'],
        maxlength : 10
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Reverse populate with virtuals
CampgroundSchema.virtual('bookings',{
    ref:'Booking',
    localField:'_id',
    foreignField:'campground',
    justOne:false
});

//Cascade delete appointments when a campground is deleted
CampgroundSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Bookings being removed from campground ${this._id}`);
    await this.model('Booking').deleteMany({campground:this._id});
    next();
});

module.exports=mongoose.model('Campground',CampgroundSchema);
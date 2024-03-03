const mongoose=require('mongoose');

const ReservationSchema=new mongoose.Schema({
    checkInDate:{
        type:Date,
        required:true
    },
    checkOutDate:{
        type:Date,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    camp:{
        type:mongoose.Schema.ObjectId,
        ref:'Camp',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model('Reservation',ReservationSchema);
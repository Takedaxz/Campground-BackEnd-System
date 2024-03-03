const Reservation=require('../models/Reservation');
const Camp=require('../models/Camp');

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@access   Public
exports.getReservations=async (req,res,next)=>{
    let query;
    //Generalusers can see only their reservations
    if(req.user.role!=='admin'){
        query=Reservation.find({user:req.user.id}).populate({path:'camp',select:'name adddress tel'});
    }
    else{ //admin
        if(req.params.campId){
            console.log(req.params.campId);
            query=Reservation.find({camp:req.params.campId}).populate({path:'camp',select:'name address tel'});
        }
        else{
            query=Reservation.find().populate({path:'camp',select:'name address tel'});
        }
    }

    try{
        const reservations=await query;

        res.status(200).json({success:true,count:reservations.length,data:reservations});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,msg:'Cannot find Reservation'});
    }
}

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   Public
exports.getReservation=async (req,res,next)=>{
    try{
        const reservation=await Reservation.findById(req.params.id).populate({
            path:'camp',
            select:'name address tel'
        });

        if(!reservation){
            return res.status(404).json({success:false,msg:`No reservation with the id of ${req.params.id}`});
        }
        if(reservation.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({ success: false, msg: `User ${req.user.id} is not authorized to access this reservation` });
        }
        res.status(200).json({success:true,data:reservation});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot find Reservation'});
    }
};

//@desc     Add reservation
//@route    POST /api/v1/camps/:campId/reservations/
//@access   Private
exports.addReservation=async(req,res,next)=>{
    try{
    
        req.body.camp=req.params.campId;

        const camp=await Camp.findById(req.params.campId);

        if(!camp){
            return res.status(404).json({success:false,msg:`No camp with the id ${req.params.campId}`});
        }
        //Add userId to req.body
        req.body.user=req.user.id;

        const nowDate = new Date();
        
        //Calculate duration in days
        const StartDate = new Date(req.body.checkInDate);
        const EndDate = new Date(req.body.checkOutDate);

        if(nowDate>StartDate){
            return res.status(400).json({ success: false, msg: 'Reservation start date cannot be in the past.' });
        }
        
        // Check-in time validation
        const checkInHour = StartDate.getHours()-7;

        if (checkInHour >= 0 && checkInHour < 8) {
            // Check-in time is between 00:00 and 08:00
            return res.status(400).json({ success: false, msg: 'Check-in time must be between 08:00 and 24:00.' });
        }
        // Check-out time validation
        const checkOutHour = EndDate.getHours()-7;
        if(checkOutHour < 8 || checkOutHour > 12) {
            // Check-out time is before 12:00 AM
            return res.status(400).json({ success: false, msg: 'Check-out time must be between 08:00 and 12:00.' });
        }

        const Duration = Math.ceil((EndDate - StartDate) / (1000 * 60 * 60)); //in hour

        //Check duration
        if(Duration>3*24){
            return res.status(400).json({ success: false, msg: 'Reservation duration cannot exceed 3 days' });
        }
        else if(Duration<6){
            return res.status(400).json({ success: false, msg: 'Reservation duration must be at least 6 hours' });
        }

        const reservation=await Reservation.create(req.body);
        res.status(200).json({success:true,data:reservation});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot create Reservation'});
    }
};

//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation=async(req,res,next)=>{
    try{
        let reservation=await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,msg:`No reservation with the id of ${req.params.id}`});
        }

        //make sure user is the reservation owner
        if(reservation.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this reservation`});
        }

        reservation=await Reservation.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        res.status(200).json({success:true,data:reservation});

    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot update Reservation'});
    }
};


//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation=async(req,res,nex)=>{
    try{
            const reservation=await Reservation.findById(req.params.id);
            if(!reservation){
                return res.status(404).json({success:false,msg:`No reservation with the id of ${req.params.id}`});
            }
            //make sure user is the reservation owner
            if(reservation.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this reservation`});
            }

            await reservation.deleteOne();
            res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot delete Reservation'});
    }
};

//@desc     Delete all reservations
//@route    DELETE /api/v1/reservations
//@access   Private
exports.deleteReservations = async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({success: false, msg: `User ${req.user.id} is not authorized to delete reservations`});
        }

        // Delete all reservations
        await Reservation.deleteMany({});

        res.status(200).json({ success: true,data:{}, msg: 'All reservations have been deleted'});
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, msg: 'Cannot delete reservations' });
    }
};
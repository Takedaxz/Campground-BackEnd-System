const Booking=require('../models/Booking');
const Campground=require('../models/Campground');

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings=async (req,res,next)=>{
    let query;
    //Generalusers can see only their bookings
    if(req.user.role!=='admin'){
        query=Booking.find({user:req.user.id}).populate({path:'campground',select:'name adddress tel'});
    }
    else{ //admin
        if(req.params.campgroundId){
            console.log(req.params.campgroundId);
            query=Booking.find({campground:req.params.campgroundId}).populate({path:'campground',select:'name address tel'});
        }
        else{
            query=Booking.find().populate({path:'campground',select:'name address tel'});
        }
    }

    try{
        const bookings=await query;

        res.status(200).json({success:true,count:bookings.length,data:bookings});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,msg:'Cannot find Booking'});
    }
}

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking=async (req,res,next)=>{
    try{
        const booking=await Booking.findById(req.params.id).populate({
            path:'campground',
            select:'name address tel'
        });

        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
        }
        if(booking.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({ success: false, msg: `User ${req.user.id} is not authorized to access this booking` });
        }
        res.status(200).json({success:true,data:booking});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot find Booking'});
    }
};

//@desc     Add booking
//@route    POST /api/v1/campgrounds/:campgroundId/bookings
//@access   Private
exports.addBooking=async(req,res,next)=>{
    try{
    
        req.body.campground=req.params.campgroundId;

        const campground=await Campground.findById(req.params.campgroundId);

        if(!campground){
            return res.status(404).json({success:false,msg:`No campground with the id ${req.params.campgroundId}`});
        }
        //Add userId to req.body
        req.body.user=req.user.id;

        const nowDate = new Date();
        
        //Calculate duration in days
        const StartDate = new Date(req.body.checkInDate);
        const EndDate = new Date(req.body.checkOutDate);

        if(nowDate>StartDate){
            return res.status(400).json({ success: false, msg: 'Booking start date cannot be in the past.' });
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
            return res.status(400).json({ success: false, msg: 'Booking duration cannot exceed 3 days' });
        }
        else if(Duration<6){
            return res.status(400).json({ success: false, msg: 'Booking duration must be at least 6 hours' });
        }

        const booking=await Booking.create(req.body);
        res.status(200).json({success:true,data:booking});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot create Booking'});
    }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking=async(req,res,next)=>{
    try{
        let booking=await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
        }

        //make sure user is the booking owner
        if(booking.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this booking`});
        }

        // Prevent updating user ID for user
        if (req.user.role !== 'admin' && req.body.user && req.body.user !== req.user.id) {
            return res.status(401).json({ success: false, msg: `Only admin can update the user ID` });
        }
        
        booking=await Booking.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        res.status(200).json({success:true,data:booking});

    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot update Booking'});
    }
};


//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking=async(req,res,nex)=>{
    try{
            const booking=await Booking.findById(req.params.id);
            if(!booking){
                return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
            }
            //make sure user is the booking owner
            if(booking.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this booking`});
            }

            await booking.deleteOne();
            res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot delete Booking'});
    }
};

//@desc     Delete all bookings
//@route    DELETE /api/v1/bookings
//@access   Private
exports.deleteBookings = async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({success: false, msg: `User ${req.user.id} is not authorized to delete bookings`});
        }

        // Delete all bookings
        await Booking.deleteMany({});

        res.status(200).json({ success: true,data:{}, msg: 'All bookings have been deleted'});
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, msg: 'Cannot delete bookings' });
    }
};
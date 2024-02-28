const Appointment=require('../models/Appointment');
const Camp=require('../models/Camp');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments=async (req,res,next)=>{
    let query;
    //Generalusers can see only their appointments
    if(req.user.role!=='admin'){
        query=Appointment.find({user:req.user.id}).populate({path:'camp',select:'name adddress tel'});
    }
    else{ //admin
        if(req.params.campId){
            console.log(req.params.campId);
            query=Appointment.find({camp:req.params.campId}).populate({path:'camp',select:'name address tel'});
        }
        else{
            query=Appointment.find().populate({path:'camp',select:'name address tel'});
        }
    }

    try{
        const appointments=await query;

        res.status(200).json({success:true,count:appointments.length,data:appointments});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,msg:'Cannot find Appointment'});
    }
}
//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment=async (req,res,next)=>{
    try{
        const appointment=await Appointment.findById(req.params.id).populate({
            path:'camp',
            select:'name address tel'
        });

        if(!appointment){
            return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot find Appointment'});
    }
};

//@desc     Add appointment
//@route    POST /api/v1/camps/:campId/appointments/
//@access   Private
exports.addAppointment=async(req,res,next)=>{
    try{
    
        req.body.camp=req.params.campId;

        const camp=await Camp.findById(req.params.campId);

        if(!camp){
            return res.status(404).json({success:false,msg:`No camp with the id ${req.params.campId}`});
        }
        //add userId to req.body
        req.body.user=req.user.id;
        //Check for existed appointment
        const existedAppointments=await Appointment.find({user:req.user.id});
        //If the user is not a admin,they can only create 3 appointments
        if(existedAppointments.length>=3 && req.usesr.role!=='admin'){
            return res.status(400).json({success:false,msg:`The user with id ${req.user.id} has already made 3 appointments`});
        }

        const appointment=await Appointment.create(req.body);
        res.status(200).json({success:true,data:appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot create Appointment'});
    }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment=async(req,res,next)=>{
    try{
        let appointment=await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
        }
        //make sure user is the apoointment owner
        if(appointment.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this appointment`});
        }
        appointment=await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        res.status(200).json({success:true,data:appointment});

    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot update Appointment'});
    }
};


//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment=async(req,res,nex)=>{
    try{
            const appointment=await Appointment.findById(req.params.id);
            if(!appointment){
                return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
            }
            //make sure user is the apoointment owner
            if(appointment.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this appointment`});
            }

            await appointment.deleteOne();
            res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot delete Appointment'});
    }
}
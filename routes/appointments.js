const express=require('express');
const {getAppointments,getAppointment,addAppointment,updateAppointment,deleteAppointment}=require('../controllers/appointments');

const router=express.Router({mergeParams:true});
const{protect,authorize}=require('../middleware/auth');

router.route('/').get(protect,authorize('admin','user'),getAppointments).post(protect,authorize('admin','user'),addAppointment);
router.route('/:id').get(protect,authorize('admin','user'),getAppointment).put(protect,authorize('admin','user'),updateAppointment).delete(protect,authorize('admin','user'),deleteAppointment);

module.exports=router;
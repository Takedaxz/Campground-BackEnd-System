const Camp=require('../models/Camp');

//@desc     Get all camps
//@route    GET /api/v1/camps
//@access   Public
exports.getCamps= async (req,res,next)=>{
    let query;
    //Copy req.query
    const reqQuery={...req.query};
    //Fields to exclude
    const removeFields=['select','sort','page','limit'];
    //Loop pver remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);
    //Create query string
    let querStr=JSON.stringify(reqQuery);
    querStr=querStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

    query=Camp.find(JSON.parse(querStr)).populate('appointments');

    //Select fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    }
    else{
        query=query.sort('name');
    }

    //Pagination
    const page=parseInt(req.query.page,10) || 1;
    const limit=parseInt(req.query.limit,10) || 25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;

    try{
        const total=await Camp.countDocuments();
        query=query.skip(startIndex).limit(limit);

        const camps=await query;
        const pagination={};
        if(endIndex<total){
            pagination.next={page:page+1,limit}
        }
        if(startIndex>0){
            pagination.prev={page:page-1,limit}
        }
        res.status(200).json({success:true,count:camps.length,pagination,data:camps});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};


//@desc     Get single camp
//@route    GeET /api/v1/camps/:id
//@access   Public
exports.getCamp=async (req,res,next)=>{
    try{
        const camp=await Camp.findById(req.params.id);

        if(!camp){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:camp});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Create new camp
//@route    POST /api/v1/camps
//@access   Private
exports.createCamp=async (req,res,next)=>{
    const camp=await Camp.create(req.body);
    res.status(201).json({
        success:true,
        data:camp
    });
};

//@desc     Update camp
//@route    PUT /api/v1/camps/:id
//@access   Private
exports.updateCamp= async(req,res,next)=>{
    try{
        const camp=await Camp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        if(!camp){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data:camp});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Delete camp
//@route    DELETE /api/v1/camps/:id
//@access   Private
exports.deleteCamp=async(req,res,next)=>{
    try{
        const camp=await Camp.findById(req.params.id);

        if(!camp){
            return res.status(400).json({success:false});
        }

        await camp.deleteOne();
        res.status(200).json({success:true,data:{}});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};
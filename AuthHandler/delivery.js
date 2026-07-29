const jsonwebtoken = require("jsonwebtoken")

const {jwtDeliveryPass} = require("../config")

function DeliveryMiddleware(req,res,next){
const token = req.headers.token;
try{
    const decoded= jwtDeliveryPass.verify(token,jwtDeliveryPass);
    req.customerId = decoded.id;
    next();
}catch(err){
    return res.json({
        message:"Invalid Token"
    })
}

}

module.exports={
    DeliveryMiddleware
}



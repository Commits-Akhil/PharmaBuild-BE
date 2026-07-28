const jsonwebtoken = require("jsonwebtoken")

const {jwtRegionalPass} = require("../config")

function RegionalMiddleware(req,res,next){
const token = req.headers.token;
try{
    const decoded= jwtRegionalPass.verify(token,jwtRegionalPass);
    req.customerId = decoded.id;
    next();
}catch(err){
    return res.json({
        message:"Invalid Token"
    })
}

}

module.exports={
    RegionalMiddleware
}



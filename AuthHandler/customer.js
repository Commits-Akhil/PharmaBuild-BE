const jsonwebtoken = require("jsonwebtoken")

const {jwtCustomerPass} = require("../config")

function CustomerMiddleware(req,res,next){
const token = req.headers.token;
try{
    const decoded= jwtCustomerPass.verify(token,jwtCustomerPass);
    req.customerId = decoded.id;
    next();
}catch(err){
    return res.json({
        message:"Invalid Token"
    })
}

}

module.exports={
    CustomerMiddleware
}



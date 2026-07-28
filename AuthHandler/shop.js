const jsonwebtoken = require("jsonwebtoken")

const {jwtShopPass} = require("../config")

function ShopMiddleware(req,res,next){
const token = req.headers.token;
try{
    const decoded= jwtShopPass.verify(token,jwtShopPass);
    req.customerId = decoded.id;
    next();
}catch(err){
    return res.json({
        message:"Invalid Token"
    })
}

}

module.exports={
    ShopMiddleware
}



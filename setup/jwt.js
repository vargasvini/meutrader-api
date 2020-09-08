const jwt = require('jsonwebtoken');

const secret = process.env.TOKEN_SECRET

function sign(payload){
   return jwt.sign(payload, secret, {expiresIn: 86400})
} 

function decode(payload){
    return jwt.verify(token, secret)
} 


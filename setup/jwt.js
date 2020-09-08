import jwt from 'jsonwebtoken'

const secret = process.env.TOKEN_SECRET

export const sign = (payload) => jwt.sign(payload, secret, () => {console.log('funcionou')})
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function signTokenAcesso(payload) {
    return jwt.sign(payload, process.env.CHAVE, {
        expiresIn: '3h'
    })
}


export function verificarTokenAcesso(token) {
    return jwt.verify(token, process.env.CHAVE)
}

export function getToken(token) {
    return jwt.decode(token) 
}

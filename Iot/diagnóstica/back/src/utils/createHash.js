import bcrypt from "bcrypt"

const saltRound = 10;

export async function createHash(senha) {
    return await bcrypt.hash(senha, saltRound)
}
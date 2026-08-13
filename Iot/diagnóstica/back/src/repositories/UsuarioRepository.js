import { pool } from "../config/db.js";

class UsuarioRepository{

    async buscarUsuarioPorEmail(email){

       return  await pool.query("SELECT * from usuario WHERE email=$1",[email])

    }
    async buscarUsuarioPorCpf(cpf){

       return  await pool.query("SELECT * from usuario WHERE cpf=$1",[cpf])

    }
    async buscarUsuarioPorId(id){

       return  await pool.query("SELECT * from usuario WHERE id=$1",[id])

    }




    async cadastrarUsuario({nome,email,cpf,senha}){

        return pool.query(
            `INSERT INTO usuario (nome, email, cpf, senha)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nome, email, cpf, status_user, tipo`,
            [nome, email, cpf, senha]
        )
    }

    async mudarPermissaoUsuario({id,permissao}){

        return await pool.query("UPDATE usuario SET status_user=$1 where id=$2 RETURNING *", [permissao,id])

    }
    
}


export const usuarioRepository = new UsuarioRepository()

import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import bcrypt from "bcrypt"
import { signTokenAcesso } from "../utils/jwt.js";
import { createHash } from "../utils/createHash.js";



class UsuarioServices {

    async login({ email, senha }) {

        const usuario = await usuarioRepository.buscarUsuarioPorEmail(email)


        const usuarioEncontrado = usuario.rows[0]

        if (!usuarioEncontrado) {
            throw new Error("Credenciais inválidas")
        }

        const compareHash = await bcrypt.compare(senha || "", usuarioEncontrado.senha || "")

        if (usuarioEncontrado.status_user !== "ATIVO") {


            throw new Error("Usuário esperando ativação ou desativado")

        }

        if (usuario.rows[0] && compareHash) {

            const usuarioLogado = usuarioEncontrado

            const token = signTokenAcesso({
                email: usuarioLogado.email,
                nome: usuarioLogado.nome,
                tipo: usuarioLogado.tipo,

            })

            return token

        }

        throw new Error("Credenciais inválidas")

    }


    async cadastro({nome,email,cpf,senha}){

        const buscarBancoEmail =  await usuarioRepository.buscarUsuarioPorEmail(email)
        const buscarBancoCpf = await usuarioRepository.buscarUsuarioPorCpf(cpf)
        
        if (buscarBancoEmail.rows>0||buscarBancoCpf.rows>0) {

            throw new Error("Dados inválidos")
            
            
        }


        const hash = await createHash(senha)

        const usuario = {

            nome,
            email,
            cpf,
            senha:hash
        }

        const cadastro = await usuarioRepository.cadastrarUsuario(usuario)

        return cadastro

    }

    async mudarStatus({id,status}){

        const typeStarus = {
            pendente : 'PENDENTE',
            ativar : "ATIVO",
            desativar : "DESATIVADO"
        }

        const usuario =  await usuarioRepository.buscarUsuarioPorId(id)

        if (usuario.rows.length===0|| !typeStarus[status]) {

            throw new Error("Usuário ou status nao encontrado");
            
        }

        const usuarioAtualizado = await usuarioRepository.mudarPermissaoUsuario({
            id,
            permissao: typeStarus[status]
        })

        return usuarioAtualizado


    }

}



export const  usuarioServices = new UsuarioServices()

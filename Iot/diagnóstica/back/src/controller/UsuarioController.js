import { usuarioServices } from "../services/UsuarioServices.js"


class UsuarioController {

    async login(req, res) {

        const {email,senha} = req.body

        if (!email || !senha) {
            
            res.status(422).json({
                message: "Campos Vazios"
            })
        }

        try {

            const token = await usuarioServices.login({email,senha})


            res.status(200).json({message:"Usuário logado com sucesso",token})
            
        } catch (error) {

            res.status(500).json({message:"Erro interno no servidor"})
            
        }

    }
    async cadastrar(req, res) {

        
        const {email,senha,cpf,nome} = req.body

        if (!email || !senha ||!cpf ||! nome) {
            
            res.status(422).json({
                message: "Campos Vazios"
            })
        }

        try {

            const usuarioCriado = await usuarioServices.cadastro({email,senha,cpf,nome})

            if (usuarioCriado.rows[0].cpf === cpf) {
                
                res.status(200).json({message:"Usuário Cadastrado com sucesso"})
                return
            }

            res.status(400).json("Não foi possível cadastrar usuário")


        } catch (error) {

            res.status(500).json({message:"Erro interno no servidor"})
            
        }




    }
    async mudarStatus(req, res) {

        const {id,novoStatus} = req.body

        try {

            const  usuarioModificado= await usuarioServices.mudarStatus({id,status:novoStatus})

                
            if (usuarioModificado.rowCount > 0){

             return res.status(200).json({message:"Status alterado com sucesso"})
            }

            return res.status(400).json({message:"Nao foi possível alterar o status, tente novamente mais trade"})
       
        } catch (error) {

            res.status(500).json({message:"Erro interno no servidor"})
            
        }






    }

}


export const usuarioController = new UsuarioController()

## ENTREGA 01.1 — Requisitos Funcionais

| ID     | Requisito           | Descrição                                                                 |
|--------|--------------------|---------------------------------------------------------------------------|
| RF-01  | Gerenciar Usuários | Criar, ler, atualizar e deletar usuários, agendar serviços de
faxina, gerenciar os horários e a disponibilidade, e registrar interações entre os clientes e a empresa. |
| RF-02  | Autenticação de Usuário | Validar credenciais de email e senha para login                            |
| RF-03  | Gerenciar cliente  | Criar, ler, atualizar e deletar e agendar faxina       |
| RF-04  | Gerenciar profissional| Criar, ler, atualizar e deletar e agendar faxina                     |
| RF-05  | Tratamento de Erros | Retornar mensagens de erro adequadas em todas as operações               |
| RF-06  | Validação de Dados | Validar campos obrigatórios (nome, email, senha, preço, quantidade)     |

---


## ENTREGA 2 - Diagrama entidade relacionamento (DER) 


Arquivo DER contém o diagrama


## ENTREGA 3 - Script de criação e população do banco de dados  

todo script do banco incluindo os registros estão no arquivo schema.sql


## ENTREGA 9 - Lista de requisitos de infraestrutura

Para o desenvolvimento e a execução do sistema CleanCare, foram utilizados os seguintes recursos de infraestrutura:

| Item | Tecnologia | Versão utilizada | Finalidade no sistema |
|------|------------|------------------|----------------------|
| 9.1.1 | PostgreSQL | 18.3 | Sistema Gerenciador de Banco de Dados (SGBD) responsável pela persistência de usuários, clientes, profissionais, disponibilidades e agendamentos. |
| 9.1.2 | JavaScript | ECMAScript 2024, executado no Node.js 22.18.0 | Linguagem utilizada no frontend React e no backend Node.js/Express. |


### Requisitos complementares

- Node.js 22.18.0 para execução do backend e das ferramentas do frontend.
- npm 10.9.3 para instalação e gerenciamento das dependências.
- Driver `pg` 8.23.0 para comunicação entre o backend e o PostgreSQL.
- PostgreSQL com suporte à função `gen_random_uuid()`, utilizada na geração de identificadores UUID.

As versões do PostgreSQL, Node.js e npm foram verificadas diretamente no ambiente de desenvolvimento.














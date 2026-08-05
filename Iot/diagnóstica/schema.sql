CREATE TYPE type_usuario AS ENUM ("FUNCIONARIO","ADMIN");

CREATE TABLE usuario(
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
nome VARCHAR(50),
email VARCHAR(255),
cpf BIGINT(11),
senha varchar(50)
tipo type_usuario
);

CREATE TYPE type_faxina AS ENUM ("PESADA","MEDIA","LEVE","TODOS")

CREATE TABLE cliente (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nome VARCHAR(50),
cpf BIGINT(11),
email VARCHAR(255),
cep INT(8),
rua VARCHAR(255),
numero VARCHAR(30),
tipo type_faxina DEFAULT("TODOS")
);

CREATE TABLE profissional(
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nome VARCHAR(50),
email VARCHAR(255),
cpf BIGINT(11),
senha varchar(50),
tipo type_faxina DEFAULT("TODOS")

);
CREATE TYPE type_usuario AS ENUM ('FUNCIONARIO', 'ADMIN');

CREATE TYPE type_status AS ENUM ('PENDENTE', 'ATIVO', 'DESATIVADO');

CREATE TYPE type_faxina AS ENUM ('PESADA', 'MEDIA', 'LEVE', 'TODOS');

CREATE TYPE type_ambiente AS ENUM ('RESIDENCIAL', 'COMERCIAL');

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    status_user type_status DEFAULT 'PENDENTE',
    tipo type_usuario DEFAULT 'FUNCIONARIO'
);

CREATE TABLE cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    cep VARCHAR(8) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(30) NOT NULL,
    tipo type_faxina NOT NULL
);

CREATE TABLE profissional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo type_faxina DEFAULT 'TODOS'
);

CREATE TABLE disponibilidade_profissional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID NOT NULL,
    data_disponivel DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

CREATE TABLE agendamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    profissional_id UUID NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ambiente type_ambiente NOT NULL,
    tipo_faxina type_faxina NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- Dados iniciais para demonstração.
-- Senha dos usuários e profissionais: Senha@123

INSERT INTO usuario (id, nome, email, cpf, senha, status_user, tipo) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Ana Administradora',
        'ana.admin@faxina.com',
        '11111111111',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'ATIVO',
        'ADMIN'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Bruno Funcionário',
        'bruno.funcionario@faxina.com',
        '22222222222',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'PENDENTE',
        'FUNCIONARIO'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Carla Funcionária',
        'carla.funcionaria@faxina.com',
        '33333333333',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'ATIVO',
        'FUNCIONARIO'
    );

INSERT INTO cliente (id, nome, cpf, email, cep, rua, numero, tipo) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        'Daniel Souza',
        '44444444444',
        'daniel.souza@email.com',
        '01001000',
        'Praça da Sé',
        '100',
        'LEVE'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'Elisa Lima',
        '55555555555',
        'elisa.lima@email.com',
        '20040002',
        'Rua da Assembleia',
        '25',
        'MEDIA'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        'Fábio Costa',
        '66666666666',
        'fabio.costa@email.com',
        '30130010',
        'Avenida Afonso Pena',
        '800',
        'PESADA'
    );

INSERT INTO profissional (id, nome, email, cpf, senha, tipo) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        'Gabriela Santos',
        'gabriela.santos@faxina.com',
        '77777777777',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'LEVE'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        'Henrique Alves',
        'henrique.alves@faxina.com',
        '88888888888',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'MEDIA'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        'Isabela Rocha',
        'isabela.rocha@faxina.com',
        '99999999999',
        '$2b$10$YzfRXtuu3f7w03vGks5WteehfWEzWyYXD97Fpqno9us5JTAONcBue',
        'TODOS'
    );

INSERT INTO agendamento (
    id,
    cliente_id,
    profissional_id,
    data_agendamento,
    hora_inicio,
    hora_fim,
    ambiente,
    tipo_faxina,
    status,
    observacoes
) VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '2030-01-14',
        '09:00',
        '11:00',
        'RESIDENCIAL',
        'LEVE',
        'PENDENTE',
        'Limpeza geral do apartamento'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        '2030-01-15',
        '13:00',
        '16:00',
        'COMERCIAL',
        'MEDIA',
        'CONFIRMADO',
        'Limpeza do escritório'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        '2030-01-16',
        '08:00',
        '12:00',
        'RESIDENCIAL',
        'PESADA',
        'CONCLUIDO',
        'Faxina completa antes da mudança'
    );

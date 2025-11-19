# Guia do Desenvolvedor

## Pré-requisitos

- Node.js & npm - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase CLI (opcional, para desenvolvimento local) - `npm install -g supabase`

## Instalação

```sh
git clone <SEU_GIT_URL>
cd <NOME_DO_SEU_PROJETO>
npm install
# ou
yarn install
```

## Configuração do Ambiente

Este projeto usa Supabase para o backend. Você pode executá-lo com um banco de dados local ou conectar-se a um remoto.

### Opção 1: Desenvolvimento Local (Recomendado)

1.  Inicie a instância local do Supabase:

    ```bash
    npx supabase start
    ```

    Isso exibirá sua `API URL` e `anon key`.

2.  Copie o arquivo de exemplo de ambiente:

    ```bash
    cp .env.local.example .env.local
    ```

3.  Atualize o `.env.local` com os valores do passo 1.

### Opção 2: Banco de Dados Remoto

1.  Crie um arquivo `.env` no diretório raiz.
2.  Adicione suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_projeto
    VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
    DATABASE_URL=sua_string_de_conexao_postgres
    ```

## Executando a Aplicação

```sh
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:8080`.

# Atividade Somativa 2 - API REST Segura para Gestão de Usuários

Projeto desenvolvido para a disciplina de Sistemas Web Seguros com o objetivo de implementar uma aplicação web para gerenciamento de usuários utilizando uma API REST segura.

A aplicação possui backend e frontend e aplica conceitos de autenticação, autorização, controle de acesso baseado em perfis e segurança de aplicações web.

## Funcionalidades

O sistema permite:

- Login de usuários;
- Autenticação utilizando JWT;
- Cadastro de usuários;
- Atualização de usuários;
- Exclusão de usuários;
- Controle de acesso por perfil;
- Solicitação pública de acesso;
- Aprovação ou recusa de solicitações por administradores;
- Cadastro direto de usuários por administradores;
- Definição de senha no primeiro acesso;
- Proteção das páginas conforme perfil do usuário.

## Tecnologias

### Backend

- Node.js
- Express
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- CORS

### Frontend

- React
- Vite
- React Router DOM
- JavaScript
- CSS

### Persistência

Os dados são armazenados em arquivos JSON.

Os arquivos utilizados são:

```
backend/data/usuarios.json
backend/data/solicitacoes.json
```

### Estrutura: 

**atividade-somativa-2-api-rest-segura/**\
\
📁**backend/**
* 📁**data/**
    * ```solicitacoes.json```
    * ```usuarios.json```
* 📁**middleware/**
    * ```autenticacao.js```
    * ```autorizacao.js```
* ```.env.example```
* ```package.json```
* ```server.js```


📁**frontend/**
* 📁**src/**
    * 📁**componentes/**
    * 📁**paginas/**
    * 📄```eslint.config.js```
    * 📄```index.html```
    * 📄```package.json```
    * 📄```vite.config.js```

- 📄```LICENSE```
- 📄```package.json```
- 📄```package-lock.json```
- 📄```README.md```

## Como executar o projeto

### Pré-requisitos:

É necessário possuir Node.js e npm instalados.

### 1. Instalação:

No terminal, procure pela pasta ```atividade-somativa-2-api-rest-segura/```
Depois de certificar que você já está na pasta, rode os seguintes comandos:
* ```npm install```
* ```npm run install:all```

### 2. Configurar as variáveis de ambiente:

Rode no terminal:
**Windows PowerShell:**
* ```cd backend```
* ```New-Item .env -ItemType File```

**Bash / Linux / Mac**
* ```cd backend```
* ```touch .env```

    * Isso irá criar o arquivo ```.env``` na sua máquina.

---
- Rode no terminal para criar a sua JWT_SECRET:
```node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"```

Após isso, será retornada a chave secreta do JWT. Copie-a para seguir os próximos passos.

* No arquivo ```/backend/.env``` insira:
```text
JWT_SECRET=insira_aqui_a_sua_chave_secreta
JWT_EXPIRES_IN=1h
```

### 3. Iniciar a aplicação: 

Volte para a pasta principal do projeto pelo terminal (comando: ```cd ..```) e rode o seguinte comando: ```npm run dev```.

* O backend será executado na porta ```http://localhost:3000```.
* O frontend será executado na porta ```http://localhost:5173```.

### Usuários de demonstração:

Para facilitar os testes da aplicação, foram criados usuários de demonstração para cada perfil.

Segue login e senha de acordo com cada perfil: 

```text
Usuário administrador:
E-mail: usuario@administrador.com
Senha: 123456

Usuário operador:
E-mail: usuario@operador.com
Senha: 123456

Usuário cliente:
E-mail: usuario@cliente.com
Senha: 123456
```

Com esses usuários é possível testar o sistema de acordo com as permissões atribuídas a cada perfil.

---

## Perfis de acesso:

Utilizei do controle de acesso baseado em perfil (```RBAC```) e existem três tipos de perfis:

### Administrador:

* Possui acesso completo ao sistema.
* Pode:
    * Consultar usuários;
    * Cadastrar novos usuários;
    * Editar usuários;
    * Alterar perfis de acesso;
    * Excluir usuários;
    * Consultar solicitações de acesso;
    * Aprovar solicitações;
    * Recusar solicitações.
* Não pode:
    * Visualizar senha de usuários;
    * Criar senhas para usuários.
* Quando o próprio administrador cria um novo usuário, é gerado um código para ele compartilhar ao usuário para o primeiro acesso. O novo usuário insere o código e assim ele pode criar uma nova senha. Dessa forma, as senhas permanecem privadas e são armazenadas apenas como hash.

### Operador:

* Acesso intermediário.
* Pode:
    * Consultar usuários;
    * Editar os seus próprios dados;
    * Editar os dados de usuários com perfil de cliente.
* Não pode:
    * Cadastrar novos usuários;
    * Excluir usuários;
    * Alterar perfis de acesso;
    * Editar outros Operadores;
    * Editar Administradores;
    * Gerenciar solicitações de acesso.

### Cliente:

* Possui acesso restrito;
* Pode consultar apenas os seus próprios dados;
* Não possui acesso à listagem, cadastro, edição ou exclusão de usuários.
---
## Proteção das rotas do frontend

Além das regras existentes na API, o frontend também controla quais páginas cada perfil pode visualizar. Mesmo que um usuário tente acessar diretamente uma URL não autorizada, a aplicação impede a visualização da página.

---
## Endpoints: 

|Método|Endpoint|Acesso|Finalidade|Status de sucesso|
|---|---|---|---|---|
|POST|```/login```|Público|Autenticar usuário e gerar JWT|200
|POST|```/primeiro-acesso```|Público|Definir senha utilizando código de primeiro acesso|200
|POST|```/solicitacoes```|Público|Criar solicitação de acesso|201
|GET|```/solicitacoes```|Administrador|Listar solicitações pendentes|200
|POST|```/solicitacoes/:id/aprovar```|Administrador|Aprovar uma solicitação|201
|DELETE|```/solicitacoes/:id```|Administrador|Recusar uma solicitação|204
|GET|```/usuarios```|Administrador e Operador|Listar usuários|200
|GET|```/usuarios/:id```|Conforme permissão|Consultar usuário específico|200
|POST|```/usuarios```|Administrador|Cadastrar usuário|201
|PUT|```/usuarios/:id```|Administrador e operador|Atualizar usuário conforme permissões|200
|DELETE|```/usuarios/:id```|Administrador|Excluir usuário|204

A API também pode retornar códigos como:
* 400: dados obrigatórios ausentes ou inválidos;
* 401: autenticação inválida;
* 403: usuário autenticado sem permissão para a operação;
* 404: recurso não encontrado;
* 409: conflito, como e-mail já cadastrado.

## Autenticação com JWT

Utilização do JSON Web Token (JWT) para autenticação.

### Fluxo de login

O usuário informa: 
* E-mail
* Senha
A aplicação procura o usuário cadastrado e utiliza o ```bcrypt``` para comparar a senha informada com o hash armazenado.

Caso as credenciais estejam corretas, o servidor gera um JWT.

O token contém informações como:
```text
id
nome
perfil
iat
exp
```

Os campos iat e exp são adicionados pelo próprio JWT e representam, respectivamente, o momento de emissão e o momento de expiração do token.

Após o login, o frontend envia o token nas requisições protegidas utilizando o cabeçalho: ```Authorization: Bearer TOKEN```.
O middleware de autenticação utiliza ```jwt.verify()``` para verificar a assinatura e a validade do token.
Caso o token não seja informado, esteja inválido ou tenha expirado, a API retorna ```401```- não autorizado.

## Tempo de expiração do JWT

O token foi configurado para expirar em 1 hora (JWT_EXPIRES_IN=1h).

A utilização de um token de validade limitada reduz o período em que um token comprometido poderia ser utilizado por terceiros.

Após a expiração, é necessário realizar uma nova autenticação.

## Autorização e RBAC
Depois da autenticação, a API utiliza o perfil armazenado no JWT para determinar quais operações o usuário pode realizar.

O middleware de autorização recebe os perfis permitidos em cada endpoint.

Por exemplo, uma operação exclusiva de Administradores utiliza ```autorizarPerfis("Administrador")```.
Uma operação disponível para Administradores e Operadores utiliza ```autorizarPerfis("Administrador", "Operador")```.

Algumas regras mais específicas são verificadas no endpoint.

## Segurança das senhas

As senhas nunca são armazenadas em texto puro. Antes de serem salvas, elas são processadas utilizando ```bcrypt```.

*Usuário informa a senha -> bcrypt -> hash armazenado.*

Durante o login, a senha informada é comparada com o hash armazenado utilizando o ```bcrypt.compare()```. Dessa forma, a senha original não precisa ser recuperada para realizar a autenticação.

## OAuth 2.0
O OAuth 2.0 não foi implementado nesta aplicação, mas poderia ser utilizado caso a API precisasse ser disponibilizada para aplicações parceiras externas.

Nesse caso, não seria necessário compartilhar diretamente o usuário e a senha do sistema com cada aplicação parceira.

O parceiro seria previamente registrado e receberia credenciais próprias de aplicação.

Em uma integração entre sistemas, poderia ser utilizado o fluxo ```Client Credentials```.

O processo poderia ocorrer assim:

1. A aplicação parceira solicita autorização ao servidor de autorização.
2. O servidor valida as credenciais da aplicação parceira.
3. Se validar, é emitido o ```access token```.
4. O parceiro envia esse token ao consumir os endpoints autorizados da API.
5. A API verifica o token e as permissões concedidas antes de liberar o recurso.

**Vantagens:**
- Não compartilhar diretamente senhas de usuários;
- Permitir delegações de acesso;
- Limitar permissões utilizando escopos;
- Permitir revogação individual de acessos;
- Facilitar integrações externas;
- Padrão amplamente utilizado em APIs.

## Análise de segurança

### 1. Roubo de JWT
#### Risco:
Caso um token válido seja obtido por uma pessoa não autorizada, ele poderia ser utilizado para acessar a API enquanto permanecer válido.
#### Mitigações:
Os tokens possuem tempo de expiração de 1 hora.

Em ambiente de produção, a comunicação deve ocorrer em HTTPS para impedir a interceptação do token durante a transmissão.

Também é importante evitar registrar tokens em logs ou compartilhá-los.

### 2. Armazenamento de senhas em texto puro
#### Risco: 
Caso senhas fossem armazenadas diretamente nos arquivos ou bancos de dados, uma exposição dos dados também revelaria imediatamente as credenciais dos usuários.
#### Mitigação:
Foi utilizado ```bcrypt``` para armazenar apenas hashes das senhas.

A autenticação é realizada comparando a senha informada com o hash armazenado.

### 3. Acesso não autorizado
#### Risco:
Um usuário poderia tentar acessar endpoints ou páginas destinados a outro perfil.
#### Mitigações:
Foram utilizados:
* Autenticação JWT;
* Middleware de autorização;
* Controle de acesso baseado em perfil;
* Regras adicionais nos endpoints;
* Proteção de rotas no frontend.

O backend continua sendo responsável pela autorização real das operações. Assim, se alterar manualmente uma URL ou enviar uma requisição diretamente para a API, não é suficiente para obter uma permissão que o usuário não possui.

### 4. Código de primeiro acesso
#### Risco:
Um código de primeiro acesso armazenado em texto puro poderia ser utilizado indevidamente caso os dados fossem expostos.
#### Mitigação:
O código é gerado aleatoriamente e apenas o seu hash é armazenado. Depois que o usuário define a senha, o código é removido e não pode ser reutilizado.

### Testes realizados
Durante o desenvolvimento foram realizados testes de:
- Login válido e inválido;
- Geração de JWT;
- Acesso sem token;
- Cadastro de usuários;
- Primeiro acesso;
- Listagem de usuários;
- Atualização de usuários;
- Exclusão de usuários;
- Solicitação de acesso;
- Aprovação e recusa de solicitações;
- Controle de acesso por perfil;
- Tentativa de acesso direto às URLs protegidas;
- Restrições específicas do perfil Operador;
- Build do front-end;
- Verificação com ESLint.
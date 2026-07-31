# 🐳 Guia de Execução Docker & PostgreSQL - Ouvidoria UPA 24h

Este guia explica como rodar a aplicação **Ouvidoria UPA** em modo de produção utilizando **Docker**, **Docker Compose** e banco de dados **PostgreSQL**.

---

## 🏗️ Arquitetura dos Serviços

A infraestrutura é dividida em 3 containers independentes e integrados:

1. **`db` (PostgreSQL 16 Alpine)**:
   - Banco de dados relacional de alto desempenho para produção.
   - Armazenamento em volume persistente `postgres_data` (os dados não são perdidos ao reiniciar os containers).

2. **`backend` (API Node.js / Express em TypeScript + Prisma ORM)**:
   - Camada de negócios e acesso aos dados.
   - Executa automaticamente as atualizações de schema no PostgreSQL e a carga inicial (*seed*) na primeira inicialização.

3. **`frontend` (React + Nginx Alpine)**:
   - Build estático de alta performance servido pelo Nginx.
   - Configurado com proxy reverso transparente direcionando chamadas `/api/*` para o serviço `backend`.

---

## 🚀 Como Executar o Sistema via Docker

### Pré-requisitos
- **Docker Desktop** ou **Docker Engine + Docker Compose** instalado na máquina.

### Passo a Passo

1. **Iniciar os containers em segundo plano (Modo Detached)**:
   ```bash
   docker compose up --build -d
   ```

2. **Verificar o status dos containers**:
   ```bash
   docker compose ps
   ```

3. **Acessar a Aplicação**:
   - **Frontend (Painel Ouvidoria)**: [http://localhost:3080](http://localhost:3080)
   - **Backend API (Healthcheck)**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
   - **PostgreSQL**: Porta `5432` (Usuário: `ouvidoria_admin`, Senha: `ouvidoria_secret_pass_2026`, Database: `ouvidoria_upa_db`)

4. **Visualizar logs em tempo real**:
   ```bash
   docker compose logs -f
   ```

5. **Parar os containers**:
   ```bash
   docker compose down
   ```

---

## 🔄 Como Adicionar Futuros Novos Módulos no Sistema

A arquitetura foi projetada com o **Prisma ORM** para permitir a adição simples e automatizada de novos módulos (exemplo: *Módulo de Recursos Humanos*, *Módulo de Estoque/Farmácia*, *Módulo de Manutenção Predial*).

### Passo a Passo para Criar um Novo Módulo:

1. **Definir o modelo no Prisma Schema**:
   Abra `server/prisma/schema.prisma` e adicione a nova tabela, por exemplo:
   ```prisma
   model RhFuncionario {
     id          String   @id @default(uuid())
     nome        String
     cargo       String
     setor_id    String
     createdAt   DateTime @default(now())
   }
   ```

2. **Criar os Endpoints na API Backend**:
   Em `server/src/index.ts`, adicione as rotas da API para o novo módulo:
   ```typescript
   app.get('/api/rh/funcionarios', async (_req, res) => {
     const funcionarios = await prisma.rhFuncionario.findMany();
     res.json(funcionarios);
   });
   ```

3. **Atualizar o Banco no Container**:
   Execute o comando de sincronização do Prisma no container rodando:
   ```bash
   docker compose exec backend npx prisma db push
   ```

---

## 💾 Backup e Restauração do Banco de Dados

### Realizar Backup (Dump SQL):
```bash
docker compose exec db pg_dump -U ouvidoria_admin ouvidoria_upa_db > backup_ouvidoria.sql
```

### Restaurar Backup:
```bash
docker compose exec -T db psql -U ouvidoria_admin -d ouvidoria_upa_db < backup_ouvidoria.sql
```

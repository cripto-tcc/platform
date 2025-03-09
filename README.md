## 🚀 Como Rodar

### Pré-requisitos

- Node.js (v16 ou superior)
- NPM ou Yarn
- Carteira Phantom instalada no navegador
- Projeto criado no Firebase Console

### Configuração do Ambiente

1. Clone o repositório:

```bash
git clone <seu-repositorio>
cd platform
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.development` na raiz do projeto com as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 🔐 Sistema de Login (Firebase + Phantom)

O sistema de autenticação combina a segurança da Web3 com a praticidade do Firebase, seguindo o fluxo:

### Fluxo de Autenticação

1. **Conexão Inicial**

   - Usuário clica em "Connect with Phantom"
   - Sistema verifica se a carteira Phantom está instalada
   - Se não estiver, redireciona para página de instalação

2. **Autenticação Firebase**

   - Após conexão com Phantom, sistema cria uma sessão anônima no Firebase
   - O endereço da carteira é associado ao perfil do usuário
   - Firebase mantém o estado de autenticação entre sessões

3. **Gerenciamento de Estado**
   - Sistema monitora mudanças na conexão da carteira
   - Desconexão da carteira causa logout automático
   - Estado de autenticação é sincronizado entre Firebase e aplicação

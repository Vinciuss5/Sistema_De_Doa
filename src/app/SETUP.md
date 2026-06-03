# 🔐 Configuração do Sistema de Autenticação

## ✅ Status: Sistema Pronto para Uso!

O sistema de autenticação e banco de dados está totalmente configurado e funcional.

## 🚀 Como Começar

### 1. Criar Primeiro Usuário

Na tela de login, clique em **"Cadastre-se"** para criar sua primeira conta:

- **Nome**: Seu nome completo
- **Email**: email@instituicao.org
- **Senha**: Mínimo 6 caracteres

O sistema criará automaticamente a conta e fará login.

### 2. Fazer Login

Use o email e senha cadastrados para acessar o sistema.

## 📊 Estrutura do Banco de Dados

O sistema usa o **Supabase KV Store** para armazenar todos os dados:

### Prefixos de Chaves:

- `user:*` - Dados de usuários
- `donor:*` - Doadores (DOA001, DOA002, etc.)
- `beneficiary:*` - Beneficiários (BEN001, BEN002, etc.)
- `product:*` - Produtos/Roupas doadas
- `distribution:*` - Registros de distribuição

## 🔒 Segurança

- ✅ Autenticação JWT via Supabase Auth
- ✅ Todas as rotas protegidas (exceto login/signup)
- ✅ Validação de tokens no backend
- ✅ Persistência de sessão
- ✅ SUPABASE_SERVICE_ROLE_KEY segura no servidor

## 📋 Próximas Etapas de Integração

Para integrar completamente os componentes existentes com o backend:

1. **DonorRegistration** → Chamar `createDonor()` da API
2. **BeneficiaryRegistration** → Chamar `createBeneficiary()` da API
3. **ProductRegistration** → Chamar `createProduct()` da API
4. **DonorSearchScreen** → Carregar com `getDonors()` da API
5. **BeneficiarySearchScreen** → Carregar com `getBeneficiaries()` da API
6. **StockScreen** → Carregar com `getProducts()` da API
7. **ReportsScreen** → Usar `getStats()` e `getDistributions()` da API

## 🛠️ API Disponível

Todas as funções estão em `/utils/api.tsx`:

```typescript
// Doadores
getDonors()
getDonor(code)
createDonor(donor)
updateDonor(code, donor)

// Beneficiários
getBeneficiaries()
getBeneficiary(code)
createBeneficiary(beneficiary)
updateBeneficiary(code, beneficiary)

// Produtos
getProducts()
getProduct(id)
createProduct(product)
updateProduct(id, product)

// Distribuições
getDistributions()
createDistribution(distribution)

// Estatísticas
getStats()
```

## 🧪 Testando

1. Cadastre um usuário
2. Faça login
3. No Menu Principal, use o botão de **Logout** (ícone vermelho) para sair
4. Faça login novamente - a sessão persiste entre refreshes

## 💡 Dicas

- O primeiro usuário criado tem acesso total ao sistema
- Códigos DOA/BEN são únicos e validados no backend
- Distribuições atualizam o estoque automaticamente
- Todos os erros são logados no console para debugging

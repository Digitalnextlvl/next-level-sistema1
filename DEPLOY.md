# Deploy na Vercel

## Configurações Resolvidas

### 1. Conflito de Dependências TypeScript
- ✅ Atualizado `typescript` para versão `^5.8.3`
- ✅ Mantido `typescript-eslint` na versão `^8.38.0`
- ✅ Criado arquivo `.npmrc` com `legacy-peer-deps=true`

### 2. Configuração Vercel
- ✅ Criado `vercel.json` com configurações otimizadas
- ✅ Configurado `installCommand` com `--legacy-peer-deps`
- ✅ Configurado `buildCommand` e `outputDirectory`
- ✅ Adicionado rewrites para SPA

### 3. Otimizações de Build
- ✅ Atualizado `vite.config.ts` com otimizações
- ✅ Configurado `manualChunks` para melhor performance
- ✅ Adicionado `optimizeDeps` e `define`

## Passos para Deploy

### 1. Conectar ao GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório do Next Level Sistema

### 2. Configurar Variáveis de Ambiente
Configure as seguintes variáveis de ambiente na Vercel:

```bash
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Configurações do Projeto
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Verifique se não há erros nos logs

## Solução de Problemas

### Erro de Dependências
Se ainda houver problemas com dependências:
1. Verifique se o arquivo `.npmrc` está presente
2. Confirme que `legacy-peer-deps=true` está configurado
3. Tente fazer deploy novamente

### Erro de Build
Se houver erro no build:
1. Verifique os logs da Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste o build localmente com `npm run build`

### Erro de Runtime
Se a aplicação não carregar:
1. Verifique se as URLs do Supabase estão corretas
2. Confirme que o CORS está configurado no Supabase
3. Verifique se as Edge Functions estão funcionando

## Configurações Recomendadas

### Supabase
1. Configure CORS no Supabase para incluir seu domínio da Vercel
2. Verifique se as Edge Functions estão deployadas
3. Confirme que as políticas RLS estão corretas

### Performance
- O build está otimizado com code splitting
- Assets são servidos com cache adequado
- SPA routing configurado corretamente

## Suporte
Se ainda houver problemas, verifique:
1. Logs completos da Vercel
2. Console do navegador para erros de runtime
3. Configurações do Supabase

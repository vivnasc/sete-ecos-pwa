# Scripts de Teste - Vitalis

## 🧪 Criar Utilizador de Teste Completo

Para evitar preencher o intake repetidamente durante os testes:

```bash
node scripts/criar-usuario-teste-vitalis.js
```

Ou com email personalizado:

```bash
node scripts/criar-usuario-teste-vitalis.js maria@teste.local
```

**O que o script faz:**
- ✅ Cria utilizador no Supabase Auth
- ✅ Insere dados em `users`
- ✅ Cria cliente Vitalis com **trial ativo** (14 dias)
- ✅ Preenche intake completo
- ✅ Gera plano nutricional (fase indução, keto+IF)

**Senha padrão:** `teste123456`

**Após executar:**
1. Fazer login com as credenciais geradas
2. Ir para `/vitalis/dashboard`
3. Verificar que o plano aparece corretamente

---

## 🎁 Criar Código Promo de 20%

Três formas de criar o código promo `VEMVITALIS20`:

### 1. Via Node.js (recomendado)
```bash
node scripts/create-promo-20.js
```

### 2. Via SQL
Execute o ficheiro `scripts/PROMO_20_PERCENT.sql` na consola SQL do Supabase.

### 3. Via Browser Console
Abra o ficheiro `scripts/PROMO_20_BROWSER.md` e siga as instruções.

---

## 📝 Notas

- Todos os scripts usam variáveis de ambiente do `.env`
- Certifique-se que `VITE_SUPABASE_ANON_KEY` está configurada
- Scripts são idempotentes (podem ser executados várias vezes)

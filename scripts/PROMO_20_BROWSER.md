# Criar Código Promo 20% (Via Browser Console)

Execute este código na consola do browser (F12) enquanto estiver logado em /vitalis ou qualquer página do app:

```javascript
// Criar código promo de 20% de desconto
(async function createPromo20() {
  const { supabase } = await import('./src/lib/supabase.js');

  const code = 'VEMVITALIS20';
  const discount = 20;
  const maxUses = 500;
  const expiresInDays = 90;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiresInDays);

  const insertData = {
    code: code,
    type: 'promo',
    max_uses: maxUses,
    uses_count: 0,
    notes: `${discount}`,
    active: true,
    expires_at: expiryDate.toISOString(),
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('vitalis_invite_codes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️ Código já existe. Atualizando...');
        const { error: updateError } = await supabase
          .from('vitalis_invite_codes')
          .update({
            max_uses: maxUses,
            notes: `${discount}`,
            active: true,
            expires_at: expiryDate.toISOString()
          })
          .eq('code', code);

        if (updateError) throw updateError;
        console.log('✅ Código atualizado!');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Código criado!');
    }

    console.log('\n📋 Código: ' + code);
    console.log('💰 Desconto: ' + discount + '%');
    console.log('📊 Máx usos: ' + maxUses);
    console.log('📅 Expira: ' + expiryDate.toLocaleDateString('pt-PT'));

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
```

## OU via função exportada (recomendado):

No CoachDashboard ou qualquer página de admin, chame:

```javascript
import { generatePromoCode } from './lib/subscriptions';

// Criar promo de 20%
const result = await generatePromoCode(20, 'VEMVITALIS20', 500, 90);
console.log(result);
```

## Verificar código criado:

```javascript
const { data } = await supabase
  .from('vitalis_invite_codes')
  .select('*')
  .eq('code', 'VEMVITALIS20')
  .single();

console.log(data);
```

## Testar código:

1. Vá para `/vitalis/pagamento`
2. Digite `VEMVITALIS20` no campo "Código de convite ou desconto"
3. Clique em "Aplicar código"
4. Deve aparecer "20% de desconto aplicado!"
5. Os preços devem mostrar 20% de desconto

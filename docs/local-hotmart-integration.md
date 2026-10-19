# Teste local de integração Hotmart

Este procedimento usa apenas Docker e Supabase locais. Não execute `supabase link`, `supabase db push` ou comandos com `--linked`.

1. No Prompt de Comando, dentro de `MI2027`, confirme que a stack local está ativa:

   ```cmd
   npx supabase start
   ```

2. Aplique apenas migrações pendentes no banco **local**, sem recriar nem apagar os seus dados locais:

   ```cmd
   npx supabase migration up --local
   ```

   Use `npx supabase db reset` somente se decidir explicitamente descartar todos os dados locais.

3. Execute o teste HTTP completo:

   ```cmd
   scripts\run-local-hotmart-integration.cmd
   ```

O script obtém chaves geradas pelo Supabase local diretamente no processo, nunca as imprime, inicia Next.js em `127.0.0.1:3100`, envia Hottok fictício e remove os seus próprios utilizadores, compras, eventos e acessos de teste ao finalizar.

Os cenários são: aprovação, 365 dias, duplicidade, Hottok inválido, produto `0`, evento fora de ordem, reembolso, cancelamento, chargeback, preservação de outra compra ativa e vinculação após confirmação de e-mail.

O executor recusa URLs que não sejam `localhost` ou `127.0.0.1`.

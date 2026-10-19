# Checklist de produção — Luna Planner

Nenhum destes passos deve usar `supabase link`, `db push`, `--linked` ou a migração local `20261015000000_local_user_access.sql`.

> Estado em 2026-10-17: `supabase/production-planner-items.sql` foi aplicado manualmente ao projeto `mi2027` após preflight e validado. A constraint agora inclui `planner`, RLS continua ativo e as permissões do browser foram restringidas. Não o reaplique sem um novo preflight e aprovação.

1. No Supabase de produção, execute `supabase/production-preflight.sql` e guarde o resultado.
2. Confirme que `public.user_access` já contém `user_id`, `status` e `access_until`, e que o middleware continua a exigir `status = 'active'` com acesso não expirado.
3. A auditoria de 2026-10-17 encontrou as tabelas, funções e o gatilho Hotmart já instalados em produção. Não reaplique `20261015000001_hotmart_access.sql` sem uma revisão de diff explícita. Nunca aplique a migração `20261015000000_local_user_access.sql` em produção.
4. Confirme os resultados já aplicados de `supabase/production-planner-items.sql`: políticas RLS de acesso pago preservadas, módulo de snapshot `planner` aceito e permissões diretas do navegador reduzidas ao mínimo necessário.
5. A auditoria de perfis confirmou `public.profiles(user_id, display_name, created_at)` e as políticas RLS por utilizador, mas o bucket privado `profile-photos` ainda não existe. Revise e aplique `supabase/profile-storage.sql` apenas após aprovação para habilitar fotografias de perfil; ele adiciona somente `avatar_path`, cria o bucket privado e a política de Storage por utilizador.
6. No Vercel, confirme a existência (sem revelar valores) de `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `HOTMART_WEBHOOK_HOTTOK` e `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` em Production. As duas variáveis sem `NEXT_PUBLIC_` devem permanecer Server-only.
7. Confirme que `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` aponta para o checkout do produto 8732001 e para o preço comercial aprovado.
8. Mantenha o webhook Hotmart desativado. Quando o deploy aprovado estiver concluído, cadastre a URL `https://SEU-DOMINIO/api/webhooks/hotmart`, configure o Hottok igual ao segredo server-only da Vercel e faça um teste autorizado antes de o ativar.
9. Após o deploy manual, valide login, `/sem-acesso`, utilizador ativo, utilizador sem acesso, sincronização entre dois navegadores e o endpoint Hotmart com um evento de teste de produto 8732001.

## Limitações conhecidas

- O snapshot do planner é sincronizado em `planner_items` por `user_id` e protegido por RLS. A cópia local é apenas fallback por utilizador; dados legados não são atribuídos automaticamente.
- O Diário permanece isolado localmente por `user_id`; nesta versão ele não é sincronizado por Supabase entre dispositivos.
- `carregarHabitos` e `salvarHabitos` em `lib/planner-sync.ts` são helpers legados não usados pelo fluxo atual. O planner atual usa o snapshot único `planner`; a alteração proposta mantém também os módulos legados permitidos para compatibilidade.

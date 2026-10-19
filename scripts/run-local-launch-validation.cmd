@echo off
setlocal EnableExtensions DisableDelayedExpansion

echo.
echo Luna Planner - validacao LOCAL para lancamento
echo Esta rotina nunca usa supabase link, db push, --linked ou producao.
echo Nao executa db reset e nao apaga dados locais existentes.
echo.

npx supabase status
if errorlevel 1 (
  echo.
  echo O Supabase local nao esta acessivel. Inicie-o com: npx supabase start
  exit /b 1
)

echo.
echo Estado das migracoes locais:
npx supabase migration list --local
if errorlevel 1 exit /b 1

echo.
choice /C YN /N /M "Aplicar migracoes pendentes SOMENTE no Supabase local?"
if errorlevel 2 goto unit_tests

echo.
echo Aplicando migracoes locais sem reset de banco...
npx supabase migration up --local
if errorlevel 1 exit /b 1

:unit_tests
echo.
call npm run test:planner-storage
if errorlevel 1 exit /b 1
call npm run test:diary-storage
if errorlevel 1 exit /b 1
call npm run test:middleware
if errorlevel 1 exit /b 1
call npm run test:profile-schema
if errorlevel 1 exit /b 1
call npm run test:hotmart
if errorlevel 1 exit /b 1
call npm run typecheck
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1

echo.
echo O teste de integracao Hotmart cria e remove apenas usuarios e transacoes ficticias locais.
choice /C YN /N /M "Executar o teste de integracao Hotmart local?"
if errorlevel 2 goto done

call scripts\run-local-hotmart-integration.cmd
if errorlevel 1 exit /b 1

:done
echo.
echo Validacao local concluida.
exit /b 0

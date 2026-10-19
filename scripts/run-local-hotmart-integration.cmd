@echo off
setlocal EnableExtensions DisableDelayedExpansion
set "EXIT_CODE_FILE=%TEMP%\luna-hotmart-local.exitcode"

for /f "tokens=1,* delims==" %%A in ('npx supabase status -o env') do set "%%A=%%~B"

if not defined API_URL (
  echo Supabase local is not available. Run npx supabase start first.
  exit /b 1
)

set "NEXT_PUBLIC_SUPABASE_URL=%API_URL%"
set "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%ANON_KEY%"
set "SUPABASE_SERVICE_ROLE_KEY=%SERVICE_ROLE_KEY%"
set "HOTMART_WEBHOOK_HOTTOK=luna-local-integration-hottok"
set "HOTMART_TEST_BASE_URL=http://127.0.0.1:3100"

node scripts\hotmart-local-integration.mjs
set "TEST_EXIT=%ERRORLEVEL%"
> "%EXIT_CODE_FILE%" echo %TEST_EXIT%
if not "%TEST_EXIT%"=="0" echo Local Hotmart integration failed with exit code %TEST_EXIT%.
if "%TEST_EXIT%"=="0" echo Local Hotmart integration completed successfully.
exit /b %TEST_EXIT%

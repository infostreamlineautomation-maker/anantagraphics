@echo off
setlocal EnableExtensions
:: Ananta Graphics - project setup (Windows)
::   scripts\setup.bat          development setup
::   scripts\setup.bat --prod   production-style env (APP_ENV=production)
::
:: Safe to re-run: creates only what is missing, re-installs dependencies, applies new migrations.

set "ROOT=%~dp0.."
pushd "%ROOT%"
set "ROOT=%CD%"
set "BACKEND=%ROOT%\backend"
set "VENV_PY=%BACKEND%\venv\Scripts\python.exe"
set "MODE=dev"
if /i "%~1"=="--prod" set "MODE=prod"
set "INIT_FLAG="
if "%MODE%"=="prod" set "INIT_FLAG=--prod"

echo ===================================================
echo  Ananta Graphics - Setup (%MODE%)
echo ===================================================

echo [1/5] Checking prerequisites...
:: Prefer the py launcher; the "python" Store alias is rejected by the version check below
set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY where python >nul 2>nul && set "PY=python"
if not defined PY (echo [error] Python not found. Install Python 3.11+ from python.org. & goto :fail)
%PY% -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
if errorlevel 1 (echo [error] Python 3.11+ required - install it from python.org. & goto :fail)
where node >nul 2>nul || (echo [error] Node.js not found. Install Node.js 20+. & goto :fail)
where npm >nul 2>nul || (echo [error] npm not found. & goto :fail)
node -e "process.exit(+process.versions.node.split('.')[0] >= 20 ? 0 : 1)" || (echo [error] Node.js 20+ required. & goto :fail)
where psql >nul 2>nul || echo [warn] psql not on PATH - fine if PostgreSQL is installed as a service.

echo [2/5] Backend virtualenv + Python packages...
cd /d "%BACKEND%"
if not exist "%VENV_PY%" (%PY% -m venv venv || goto :fail)
"%VENV_PY%" -m pip install --upgrade pip -q --disable-pip-version-check || goto :fail
set "REQS=requirements-dev.txt"
if "%MODE%"=="prod" set "REQS=requirements.txt"
"%VENV_PY%" -m pip install -r %REQS% -q --disable-pip-version-check || goto :fail
if not exist "uploads" mkdir uploads

echo [3/5] Env files (secrets are generated once and never overwritten)...
"%VENV_PY%" -m app.cli init-env %INIT_FLAG% || goto :fail

echo [4/5] Node packages (tooling, website, CMS)...
call :npm_install "%ROOT%" || goto :fail
call :npm_install "%ROOT%\frontend" || goto :fail
call :npm_install "%ROOT%\cms" || goto :fail

echo [5/5] Database: create if missing, migrate, seed...
cd /d "%BACKEND%"
set "DB_OK=1"
"%VENV_PY%" -m app.cli create-db || set "DB_OK=0"
if "%DB_OK%"=="1" (
    venv\Scripts\alembic.exe upgrade head || set "DB_OK=0"
)
if "%DB_OK%"=="1" (
    "%VENV_PY%" -m app.seed || set "DB_OK=0"
)
if "%DB_OK%"=="0" (
    echo [warn] Database step skipped - check DATABASE_URL in backend\.env and that PostgreSQL is running,
    echo        then re-run scripts\setup.bat
)

echo.
if "%DB_OK%"=="1" (echo Setup complete.) else (echo Setup finished - the database still needs attention, see above.)
echo   Create a CMS login : cd backend ^&^& venv\Scripts\python -m app.cli create-admin --email you@example.com
echo   Start dev servers  : scripts\run.bat
echo   Production mode    : scripts\run.bat prod
popd
exit /b 0

:npm_install
cd /d "%~1"
if exist package-lock.json (
    call npm ci --no-audit --no-fund
) else (
    call npm install --no-audit --no-fund
)
exit /b %errorlevel%

:fail
echo Setup failed.
popd
exit /b 1

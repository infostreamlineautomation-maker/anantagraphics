@echo off
setlocal EnableExtensions EnableDelayedExpansion
:: Ananta Graphics - run all services (Windows)
::   scripts\run.bat          dev: hot reload, Ctrl+C stops everything
::   scripts\run.bat prod     production mode: migrate + seed, build website + CMS, serve (set SKIP_BUILD=1 to reuse a build)
::
:: Ports (override with e.g. "set WEB_PORT=3100" before running): WEB 3000, CMS 3001, API 8000, ADMIN_API 8001

set "ROOT=%~dp0.."
pushd "%ROOT%"
set "ROOT=%CD%"

if "%WEB_PORT%"=="" set "WEB_PORT=3000"
if "%CMS_PORT%"=="" set "CMS_PORT=3001"
if "%API_PORT%"=="" set "API_PORT=8000"
if "%ADMIN_API_PORT%"=="" set "ADMIN_API_PORT=8001"
set "PORTS=%API_PORT% %ADMIN_API_PORT% %WEB_PORT% %CMS_PORT%"

set "MODE=%~1"
if "%MODE%"=="" set "MODE=dev"
if /i not "%MODE%"=="dev" if /i not "%MODE%"=="prod" (
    echo [error] Unknown command "%MODE%" - use: dev ^| prod
    popd & exit /b 1
)

if not exist "backend\venv\Scripts\uvicorn.exe" (
    echo [error] Backend venv missing - run scripts\setup.bat first.
    popd & exit /b 1
)
for %%D in (node_modules frontend\node_modules cms\node_modules) do if not exist "%%D" (
    echo [error] %%D missing - run scripts\setup.bat first.
    popd & exit /b 1
)

call :check_ports || (popd & exit /b 1)

if /i "%MODE%"=="prod" (
    echo Applying database migrations and seeding missing content...
    pushd backend
    venv\Scripts\alembic.exe upgrade head || (popd & popd & exit /b 1)
    venv\Scripts\python.exe -m app.seed || (popd & popd & exit /b 1)
    popd
)

echo ===================================================
echo  Ananta Graphics - %MODE%
echo   Website   http://localhost:%WEB_PORT%
echo   CMS       http://localhost:%CMS_PORT%
echo   API       http://localhost:%API_PORT%/docs
echo   Admin API http://localhost:%ADMIN_API_PORT%/docs
echo  Press Ctrl+C to stop everything.
echo ===================================================

:: Ctrl+C: concurrently kills every service's process tree. Running it with stdin from NUL makes
:: cmd's "Terminate batch job (Y/N)?" prompt answer itself, so the window doesn't hang on it.
call :serve <nul
set "RC=%errorlevel%"
echo All services stopped.
popd
exit /b %RC%


:: ------------------------------------------------------------------ run the services
:serve
set "CONC=%ROOT%\node_modules\.bin\concurrently.cmd"
:: --kill-others: if one service dies (or on Ctrl+C) concurrently kills every process tree (taskkill /T)
set "CONC_OPTS=--kill-others --names API,ADMIN_API,WEB,CMS --prefix-colors blue,magenta,green,yellow"

if /i "%MODE%"=="prod" goto :serve_prod

call "%CONC%" %CONC_OPTS% ^
  "cd /d backend && venv\Scripts\uvicorn.exe app.main:app --reload --reload-dir app --port %API_PORT%" ^
  "cd /d backend && venv\Scripts\uvicorn.exe app.admin_main:app --reload --reload-dir app --port %ADMIN_API_PORT%" ^
  "cd /d frontend && npm run dev -- -p %WEB_PORT%" ^
  "cd /d cms && npm run dev -- -p %CMS_PORT%"
set "RC=%errorlevel%"
call :sweep_ports
exit /b %RC%

:serve_prod
:: The website prerenders from the API at build time, so the builds wait for /health first
set "WAIT_API=curl -fs -o nul --retry 60 --retry-delay 1 --retry-all-errors http://127.0.0.1:%API_PORT%/health"
set "WEB_CMD=cd /d frontend && npm run build && npm run start -- -p %WEB_PORT%"
set "CMS_CMD=cd /d cms && npm run build && npm run start -- -p %CMS_PORT%"
if "%SKIP_BUILD%"=="1" (
    set "WEB_CMD=cd /d frontend && npm run start -- -p %WEB_PORT%"
    set "CMS_CMD=cd /d cms && npm run start -- -p %CMS_PORT%"
)
call "%CONC%" %CONC_OPTS% ^
  "cd /d backend && venv\Scripts\uvicorn.exe app.main:app --port %API_PORT% --proxy-headers" ^
  "cd /d backend && venv\Scripts\uvicorn.exe app.admin_main:app --port %ADMIN_API_PORT% --proxy-headers" ^
  "%WAIT_API% && %WEB_CMD%" ^
  "%WAIT_API% && %CMS_CMD%"
set "RC=%errorlevel%"
call :sweep_ports
exit /b %RC%


:: ------------------------------------------------------------------ helpers
:: Sets PORT_PID to the PID listening on port %1 (IPv4 or IPv6), or clears it
:port_pid
set "PORT_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:"^ *TCP  *[^ ]*:%~1  *[^ ]*  *LISTENING"') do (
    if not "%%p"=="0" set "PORT_PID=%%p"
)
exit /b 0

:: Refuse to start on a busy port; offer to stop whatever holds it
:check_ports
for %%P in (%PORTS%) do (
    call :port_pid %%P
    if defined PORT_PID (
        set "PNAME=unknown"
        for /f "tokens=1 delims=," %%n in ('tasklist /fi "PID eq !PORT_PID!" /fo csv /nh 2^>nul') do set "PNAME=%%~n"
        echo [warn] Port %%P is already in use by !PNAME! ^(PID !PORT_PID!^).
        choice /c YN /n /m "Stop it and continue? [Y/N] "
        if errorlevel 2 (
            echo [error] Free port %%P or use other ports, e.g.  set WEB_PORT=3100 ^& scripts\run.bat
            exit /b 1
        )
        taskkill /pid !PORT_PID! /t /f >nul 2>nul
        timeout /t 1 /nobreak >nul
    )
)
exit /b 0

:: Safety net after shutdown: our ports were free at start, so anything still listening is ours
:sweep_ports
for %%P in (%PORTS%) do (
    call :port_pid %%P
    if defined PORT_PID (
        echo Stopping leftover process on port %%P ^(PID !PORT_PID!^)
        taskkill /pid !PORT_PID! /t /f >nul 2>nul
    )
)
exit /b 0

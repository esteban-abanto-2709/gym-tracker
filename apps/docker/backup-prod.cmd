@echo off
setlocal EnableExtensions

rem ===========================================================================
rem  Backup de PROD: dump de solo datos (Exercise + Routine + RoutineItem +
rem  Workout) de la BD de prod.
rem  Corre pg_dump DENTRO del contenedor gym-tracker-sql (misma version que el
rem  servidor) y copia el archivo a apps/docker/backups/.
rem
rem  Uso:
rem    backup-prod.cmd                 -> guarda en apps/docker/backups/
rem    backup-prod.cmd "D:\otra\ruta"  -> guarda en otra carpeta
rem ===========================================================================

set "SCRIPT_DIR=%~dp0"
set "CONTAINER=gym-tracker-sql"
set "OUTDIR=%SCRIPT_DIR%backups"
if not "%~1"=="" set "OUTDIR=%~1"

set "ENVFILE=%SCRIPT_DIR%.env"
if not exist "%ENVFILE%" (
    echo [ERROR] No se encontro "%ENVFILE%". Copia .env.example a .env primero.
    exit /b 1
)

rem --- Credenciales desde .env ----------------------------------------------
set "DB_USER="
set "DB_PASS="
set "DB_NAME="
for /f "usebackq tokens=1* delims==" %%a in ("%ENVFILE%") do (
    if /i "%%a"=="POSTGRES_USER"     set "DB_USER=%%b"
    if /i "%%a"=="POSTGRES_PASSWORD" set "DB_PASS=%%b"
    if /i "%%a"=="POSTGRES_DB"       set "DB_NAME=%%b"
)
if "%DB_USER%"=="" ( echo [ERROR] Falta POSTGRES_USER en .env & exit /b 1 )
if "%DB_NAME%"=="" ( echo [ERROR] Falta POSTGRES_DB en .env   & exit /b 1 )

rem --- El contenedor debe estar corriendo ------------------------------------
set "RUNNING="
for /f "usebackq delims=" %%s in (`docker inspect -f "{{.State.Running}}" %CONTAINER% 2^>nul`) do set "RUNNING=%%s"
if /i not "%RUNNING%"=="true" (
    echo [ERROR] El contenedor "%CONTAINER%" no esta corriendo. Levanta el stack de prod primero ^(docker compose up -d^).
    exit /b 1
)

rem --- Timestamp ISO desde el propio contenedor ^(evita el formato regional^) --
set "STAMP="
for /f "usebackq delims=" %%t in (`docker exec %CONTAINER% date +%%Y-%%m-%%d_%%H%%M%%S`) do set "STAMP=%%t"
if "%STAMP%"=="" ( echo [ERROR] No se pudo obtener el timestamp del contenedor. & exit /b 1 )

set "FILENAME=gym-prod_%STAMP%.sql"
set "TMP_IN_CONTAINER=/tmp/%FILENAME%"
set "DEST=%OUTDIR%\%FILENAME%"

if not exist "%OUTDIR%" mkdir "%OUTDIR%"

echo Generando backup de "%DB_NAME%" desde "%CONTAINER%"...

docker exec -e "PGPASSWORD=%DB_PASS%" %CONTAINER% pg_dump -U %DB_USER% -d %DB_NAME% --data-only --no-owner --no-privileges -t "public.\"Exercise\"" -t "public.\"Routine\"" -t "public.\"RoutineItem\"" -t "public.\"Workout\"" -f "%TMP_IN_CONTAINER%"
if errorlevel 1 ( echo [ERROR] pg_dump fallo. & exit /b 1 )

docker cp "%CONTAINER%:%TMP_IN_CONTAINER%" "%DEST%"
if errorlevel 1 ( echo [ERROR] docker cp fallo. & exit /b 1 )

docker exec %CONTAINER% rm -f "%TMP_IN_CONTAINER%" >nul 2>nul

for %%I in ("%DEST%") do set "SIZE=%%~zI"
echo Backup listo: %DEST% (%SIZE% bytes)

endlocal

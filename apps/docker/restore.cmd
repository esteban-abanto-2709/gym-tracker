@echo off
setlocal EnableExtensions

rem ===========================================================================
rem  Restore: llena la BD de dev o prod con un backup generado por backup-prod.
rem  REEMPLAZA los datos: hace TRUNCATE de Exercise/Routine/RoutineItem/Workout
rem  y carga el backup.
rem  Las tablas deben existir ya (creadas por las migraciones de Prisma).
rem
rem  Uso:
rem    restore.cmd dev                  -> usa el backup mas reciente de backups/
rem    restore.cmd prod                 -> idem, sobre prod
rem    restore.cmd dev "ruta\archivo.sql"
rem ===========================================================================

set "SCRIPT_DIR=%~dp0"

set "TARGET=%~1"
if /i "%TARGET%"=="dev"  ( set "CONTAINER=gym-tracker-dev-sql" & goto :targetok )
if /i "%TARGET%"=="prod" ( set "CONTAINER=gym-tracker-sql"     & goto :targetok )
echo Uso: restore.cmd ^<dev^|prod^> [ruta\archivo.sql]
echo   Llena la BD de dev o prod con un backup ^(REEMPLAZA los datos actuales^).
exit /b 1
:targetok

set "BACKUP=%~2"

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

rem --- El contenedor destino debe estar corriendo ----------------------------
set "RUNNING="
for /f "usebackq delims=" %%s in (`docker inspect -f "{{.State.Running}}" %CONTAINER% 2^>nul`) do set "RUNNING=%%s"
if /i not "%RUNNING%"=="true" (
    echo [ERROR] El contenedor "%CONTAINER%" ^(%TARGET%^) no esta corriendo. Levantalo primero.
    exit /b 1
)

rem --- Elegir backup mas reciente si no se paso uno --------------------------
if "%BACKUP%"=="" call :pick_latest
if "%BACKUP%"=="" (
    echo [ERROR] No hay backups en "%SCRIPT_DIR%backups\" y no diste un archivo.
    echo         Genera uno con backup-prod.cmd o pasa la ruta como 2do argumento.
    exit /b 1
)
if not exist "%BACKUP%" ( echo [ERROR] No existe el archivo "%BACKUP%". & exit /b 1 )

rem --- Confirmacion ----------------------------------------------------------
echo ============================================================
echo   RESTORE en %TARGET%  ^(contenedor %CONTAINER%, BD %DB_NAME%^)
echo   Backup:  %BACKUP%
echo   Esto BORRA y reemplaza Exercise, Routine, RoutineItem y Workout en esa BD.
echo ============================================================
set /p "CONFIRM=Escribe 'si' para continuar: "
if /i not "%CONFIRM%"=="si" ( echo Cancelado. & exit /b 1 )

rem --- Cargar ----------------------------------------------------------------
docker cp "%BACKUP%" %CONTAINER%:/tmp/restore.sql
if errorlevel 1 ( echo [ERROR] docker cp fallo. & exit /b 1 )

docker exec -e "PGPASSWORD=%DB_PASS%" %CONTAINER% psql -U %DB_USER% -d %DB_NAME% --single-transaction -v ON_ERROR_STOP=1 -c "TRUNCATE \"Workout\", \"RoutineItem\", \"Routine\", \"Exercise\" CASCADE;" -c "SET session_replication_role = replica;" -f /tmp/restore.sql
if errorlevel 1 (
    echo.
    echo [ERROR] Restore fallo. Si la BD de %TARGET% esta vacia, crea las tablas
    echo         primero con las migraciones de Prisma ^(prisma migrate dev^) y reintenta.
    docker exec %CONTAINER% rm -f /tmp/restore.sql >nul 2>nul
    exit /b 1
)

docker exec %CONTAINER% rm -f /tmp/restore.sql >nul 2>nul
echo.
echo Restore completo en %TARGET%.
endlocal
exit /b 0

:pick_latest
for /f "usebackq delims=" %%f in (`dir /b /o-d "%SCRIPT_DIR%backups\gym-prod_*.sql" 2^>nul`) do (
    set "BACKUP=%SCRIPT_DIR%backups\%%f"
    goto :eof
)
goto :eof

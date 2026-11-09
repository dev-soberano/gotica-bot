@echo off
title GOTICA BOT - CONSOLE PRINCIPAL
color 05

:inicio
cls
echo ======================================================
echo           G O T I C A   B O T  --  D E V
echo ======================================================
echo [ INFO ] Iniciando o sistema de conexao...
echo [ INFO ] Diretorio: %~dp0
echo ======================================================
echo.

REM Executa o comando de inicializacao
node index.js

REM Se o bot cair ou der erro, o script nao fecha sozinho
echo.
echo ======================================================
echo [!] O BOT FOI INTERROMPIDO OU CAIU.
echo [!] Verifique o erro acima antes de reiniciar.
echo ======================================================
echo [1] Reiniciar Agora
echo [2] Sair
echo ======================================================
set /p opt="Escolha uma opcao: "

if %opt%==1 goto inicio
if %opt%==2 exit

pause
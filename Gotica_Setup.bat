@echo off
title Gotica Bot - Instalador de Dependencias
color 05

echo ============================================
echo      CONFIGURANDO GOTICA BOT - Dev Soberano
echo ============================================

REM 1. Verifica Node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js nao encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit
)

REM 2. Instala dependencias (o coracao do bot)
echo [*] Instalando bibliotecas necessarias...
call npm install

REM 3. Verifica se existe a pasta session, se nao, avisa que vai precisar de QR Code
if not exist "session" (
    echo [*] Primeira vez detectada: Prepare o WhatsApp para escanear o QR Code.
)

echo ============================================
echo      TUDO PRONTO! INICIANDO O BOT...
echo ============================================

REM Comando de Reinicialização
node index.js

pause
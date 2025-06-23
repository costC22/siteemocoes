@echo off
title Iniciador do Servidor Node.js

echo.
echo =======================================================
echo  Iniciador do Servidor de Monitoramento de Emocoes
echo =======================================================
echo.

echo [INFO] Procurando e parando qualquer processo rodando na porta 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [INFO] Processo encontrado na porta 3000 com PID %%a. Finalizando...
    taskkill /F /PID %%a
)

echo.
echo [INFO] Processos anteriores finalizados.
echo [INFO] Aguardando 2 segundos para liberar a porta...
timeout /t 2 /nobreak > NUL

echo.
echo [SUCCESS] Iniciando o servidor Node.js...
echo.

node server.js

echo.
echo O servidor foi encerrado. Pressione qualquer tecla para fechar esta janela.
pause 
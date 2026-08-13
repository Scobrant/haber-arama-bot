@echo off
chcp 65001 > nul
title Haber Arama & AI Analiz Botu

echo ===================================================
echo   Haber Arama Botu ve AI Sunucusu Baslatiliyor...
echo ===================================================
echo.

:: 1. Python Sanal Ortami Kontrol Et
if not exist ".venv\Scripts\python.exe" (
    echo [HATA] .venv sanal ortami bulunamadi!
    pause
    exit /b 1
)

:: 2. Python AI Backend Sunucusunu Baslat
echo [1/3] Python AI Backend Sunucusu baslatiliyor (llm/main.py)...
start "AI Backend Server (main.py)" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe llm\main.py"

:: 3. React Web Frontend Sunucusunu Baslat
echo [2/3] React Web Arayuzu baslatiliyor (web)...
start "React Web Frontend" cmd /k "cd /d "%~dp0web" && npm run dev"

:: 4. Servislerin Hazirlanmasini Bekle ve Tarayiciyi Ac
echo [3/3] Sunucular hazirlaniyor, 4 saniye bekleniyor...
timeout /t 4 /nobreak > nul

echo Tarayici aciliyor: http://localhost:5173
start http://localhost:5173

echo.
echo ===================================================
echo   TUM SERVISLER BASARIYLA BASLATILDI!
echo   Pencereleri kapatarak servisleri durdurabilirsiniz.
echo ===================================================
echo.

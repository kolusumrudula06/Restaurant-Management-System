@echo off
title FOODHUB - Menu Service (Port 8081)
cd /d "%~dp0\menu-service"
echo Starting FOODHUB Menu Service on port 8081...
mvn spring-boot:run
pause

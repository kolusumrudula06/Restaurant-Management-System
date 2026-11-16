@echo off
title Launch FOODHUB Backend Microservices
echo ===================================================
echo Launching FOODHUB Spring Boot Microservices
echo 1. Menu Service  -> http://localhost:8081
echo 2. Order Service -> http://localhost:8082
echo ===================================================

start "Menu Service (Port 8081)" cmd /k "%~dp0run-menu-service.bat"
timeout /t 5 /nobreak >nul
start "Order Service (Port 8082)" cmd /k "%~dp0run-order-service.bat"

echo Both microservices have been launched in separate windows!

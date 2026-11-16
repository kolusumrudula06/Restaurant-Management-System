@echo off
title FOODHUB - Order Service (Port 8082)
cd /d "%~dp0\order-service"
echo Starting FOODHUB Order Service on port 8082...
mvn spring-boot:run
pause

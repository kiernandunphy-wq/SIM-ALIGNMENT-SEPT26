@echo off
set "NODE_DIR=%~dp0.tools\node-v24.18.0-win-x64"

if not exist "%NODE_DIR%\node.exe" (
  echo The project-local Node.js runtime is missing from "%NODE_DIR%".
  exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"
call "%NODE_DIR%\npm.cmd" run dev

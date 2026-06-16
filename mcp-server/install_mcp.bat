@echo off
echo ========================================
echo  IndiCarbon MCP — Windows Install
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installing Python dependencies...
pip install -e . --quiet
if %errorlevel% neq 0 (
    echo ERROR: pip install failed. Is Python 3.10+ on your PATH?
    pause & exit /b 1
)

echo [2/3] Configuring .env file...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo     Created .env from template. Edit it with your credentials.
) else (
    echo     .env already exists — skipping.
)

echo [3/3] Patching Claude Desktop config...
set CONFIG_DIR=%APPDATA%\Claude
set CONFIG_FILE=%CONFIG_DIR%\claude_desktop_config.json

if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

python -c "
import json, os, sys

config_path = os.path.join(os.environ['APPDATA'], 'Claude', 'claude_desktop_config.json')
mcp_entry = {
    'command': 'python',
    'args': ['-m', 'indicarbon_mcp'],
    'cwd': os.path.abspath('.'),
    'env': {
        'INDICARBON_GATEWAY_URL': 'http://localhost:8000',
        'INDICARBON_EMAIL': '',
        'INDICARBON_PASSWORD': ''
    }
}

config = {}
if os.path.exists(config_path):
    try:
        with open(config_path) as f:
            config = json.load(f)
    except Exception:
        pass

config.setdefault('mcpServers', {})['indicarbon'] = mcp_entry

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print(f'Config written to: {config_path}')
print('Restart Claude Desktop to activate the MCP.')
"

echo.
echo ========================================
echo  DONE — restart Claude Desktop now.
echo ========================================
pause

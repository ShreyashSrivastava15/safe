Write-Host "=== SAFE Project Setup ===" -ForegroundColor Cyan

# 1. Install Node deps
Write-Host "Installing Node dependencies..." -ForegroundColor Green
npm install

# 2. Setup Python venv
Write-Host "Setting up Python virtual environment..." -ForegroundColor Green
Set-Location ai-service
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
deactivate
Set-Location ..

# 3. Prisma setup
Write-Host "Setting up database..." -ForegroundColor Green
npx prisma generate
npx prisma db push

Write-Host "=== Setup complete! Run: npm run dev:all ===" -ForegroundColor Cyan

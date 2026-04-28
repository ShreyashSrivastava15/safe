Set-Location ai-service
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
Write-Host "AI service dependencies installed. Run 'npm run dev:all' to start."

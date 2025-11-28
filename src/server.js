name: Deploy Application

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          # Detectar ambiente actual y desplegar en el opuesto
          CURRENT_ENV=$(curl -s http://localhost | grep -o '"environment":"[^"]*' | cut -d'"' -f4 2>/dev/null || echo "unknown")
          echo "Ambiente actual detectado: $CURRENT_ENV"
          
          if [ "$CURRENT_ENV" = "blue" ]; then
            echo "🔄 Desplegando en GREEN..."
            ~/scripts/switch-to-green.sh "${{ secrets.PASSWORD }}"
          else
            echo "🔄 Desplegando en BLUE..."
            ~/scripts/switch-to-blue.sh "${{ secrets.PASSWORD }}"
          fi

#!/usr/bin/env bash
# PC4 - Despliegue de la capa de aplicacion de NaturaGlow en una VM Ubuntu Server 24.04 (Azure)
# Uso (desde la carpeta del repositorio):   bash scripts/setup-vm.sh
set -euo pipefail

cd "$(dirname "$0")/.."
echo "==> Carpeta del proyecto: $(pwd)"

# ---------- 1) Instalar Docker Engine + Compose (repositorio oficial de Docker) ----------
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Instalando Docker Engine..."
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"   # para usar docker sin sudo (desde el proximo inicio de sesion)
else
  echo "==> Docker ya esta instalado"
fi
sudo docker --version
sudo docker compose version

# ---------- 2) Generar .env con claves aleatorias (solo la primera vez) ----------
if [ ! -f .env ]; then
  echo "==> Generando .env con claves aleatorias..."
  gen() { openssl rand -hex 16; }
  cat > .env <<EOF
API_PORT=3000
API_KEY=$(gen)
MONGO_ROOT_USER=ng_root
MONGO_ROOT_PASSWORD=$(gen)
MONGO_APP_USER=ng_api
MONGO_APP_PASSWORD=$(gen)
CORS_ORIGIN=*
EOF
  chmod 600 .env
else
  echo "==> .env ya existe, se reutiliza"
fi

# ---------- 3) Construir la imagen y levantar los contenedores ----------
echo "==> Construyendo y levantando contenedores..."
sudo docker compose up -d --build

echo "==> Esperando a que la API este saludable..."
for i in $(seq 1 40); do
  if curl -fs http://localhost:3000/api/health >/dev/null 2>&1; then break; fi
  sleep 3
done

sudo docker compose ps
echo
curl -s http://localhost:3000/api/health; echo
echo

# IP publica desde el servicio de metadatos de Azure (no sale a Internet)
IP=$(curl -s -H Metadata:true --max-time 3 \
  "http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text" || true)

echo "======================================================================"
echo " API desplegada"
echo "   URL (Postman baseUrl):  http://${IP:-IP_PUBLICA_VM}:3000"
echo "   API key (x-api-key):    $(grep '^API_KEY=' .env | cut -d= -f2)"
echo "   Recuerda abrir el puerto 3000 en el NSG de la VM en Azure."
echo "======================================================================"

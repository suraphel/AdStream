#!/bin/bash

# EthioMarket Monitoring Stack Deployment Script
# Supports both English and Amharic output

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Language setting (default: English)
LANG=${1:-en}

# Translations
if [ "$LANG" = "am" ]; then
    STARTING_DEPLOYMENT="🚀 የክትትል ስርዓት መዘርጋት እየጀመረ..."
    CHECKING_DOCKER="🐳 ዶከር እና ዶከር-ኮምፖዝ መኖራቸውን እየተመረመረ..."
    DOCKER_NOT_FOUND="❌ ዶከር አልተገኘም። እባክዎ ዶከርን ጫኑ"
    DOCKER_COMPOSE_NOT_FOUND="❌ ዶከር-ኮምፖዝ አልተገኘም። እባክዎ ዶከር-ኮምፖዝን ጫኑ"
    CREATING_DIRS="📁 አስፈላጊ ዲ렉토ሪዎችን እየፈጠረ..."
    SETTING_PERMISSIONS="🔐 ፍቃዶችን እያደረገ..."
    STARTING_SERVICES="⚡ አገልግሎቶችን እየጀመረ..."
    WAITING_SERVICES="⏳ አገልግሎቶች እስከሚዘጋጁ ድረስ እየጠበቀ..."
    CHECKING_HEALTH="🏥 የአገልግሎቶች ጤንነት እየተመረመረ..."
    SUCCESS="✅ የክትትል ስርዓት በተሳካ ሁኔታ ተዘርግቷል!"
    ACCESS_INFO="📊 የመዳሪያ መረጃ:"
    GRAFANA_URL="   ግራፋና ዳሽቦርድ"
    PROMETHEUS_URL="   ፕሮሜቲየስ"
    ALERTMANAGER_URL="   ማንቂያ አስተዳዳሪ"
    DEFAULT_CREDS="🔑 ነባሪ የመግቢያ መረጃ - ተጠቃሚ፡ admin, መክፈቻ፡ admin123"
    HEALTH_CHECK="🔍 የጤንነት ምርመራ"
    METRICS_ENDPOINT="📈 የመለኪያ ነጥብ"
    ERROR="❌ ስህተት፡"
else
    STARTING_DEPLOYMENT="🚀 Starting EthioMarket monitoring stack deployment..."
    CHECKING_DOCKER="🐳 Checking for Docker and Docker Compose..."
    DOCKER_NOT_FOUND="❌ Docker not found. Please install Docker"
    DOCKER_COMPOSE_NOT_FOUND="❌ Docker Compose not found. Please install Docker Compose"
    CREATING_DIRS="📁 Creating required directories..."
    SETTING_PERMISSIONS="🔐 Setting permissions..."
    STARTING_SERVICES="⚡ Starting monitoring services..."
    WAITING_SERVICES="⏳ Waiting for services to be ready..."
    CHECKING_HEALTH="🏥 Checking service health..."
    SUCCESS="✅ Monitoring stack deployed successfully!"
    ACCESS_INFO="📊 Access Information:"
    GRAFANA_URL="   Grafana Dashboard"
    PROMETHEUS_URL="   Prometheus"
    ALERTMANAGER_URL="   AlertManager"
    DEFAULT_CREDS="🔑 Default credentials - User: admin, Password: admin123"
    HEALTH_CHECK="🔍 Health Check"
    METRICS_ENDPOINT="📈 Metrics Endpoint"
    ERROR="❌ Error:"
fi

echo -e "${BLUE}$STARTING_DEPLOYMENT${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}$DOCKER_NOT_FOUND${NC}"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}$DOCKER_COMPOSE_NOT_FOUND${NC}"
    echo "https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}$CHECKING_DOCKER${NC}"

# Create required directories
echo -e "${YELLOW}$CREATING_DIRS${NC}"
mkdir -p monitoring/{prometheus/{data,rules},grafana/{data,provisioning/{datasources,dashboards},dashboards},alertmanager/data}

# Set proper permissions for Grafana
echo -e "${YELLOW}$SETTING_PERMISSIONS${NC}"
sudo chown -R 472:472 monitoring/grafana/data 2>/dev/null || {
    echo "Note: Could not set Grafana permissions. Running as current user."
}

# Copy dashboard files if they don't exist
if [ ! -f monitoring/grafana/dashboards/ethiomarket-overview.json ]; then
    echo "Warning: Dashboard files not found. Please ensure dashboard JSON files are in monitoring/grafana/dashboards/"
fi

# Start the monitoring stack
echo -e "${YELLOW}$STARTING_SERVICES${NC}"
cd monitoring

# Use docker-compose or docker compose based on availability
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

$DOCKER_COMPOSE_CMD up -d

# Wait for services to be ready
echo -e "${YELLOW}$WAITING_SERVICES${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}$CHECKING_HEALTH${NC}"

check_service() {
    local service_name=$1
    local url=$2
    local timeout=30
    local count=0
    
    while [ $count -lt $timeout ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $service_name is healthy${NC}"
            return 0
        fi
        sleep 2
        count=$((count + 1))
    done
    
    echo -e "${RED}✗ $service_name is not responding${NC}"
    return 1
}

# Check each service
check_service "Prometheus" "http://localhost:9090"
check_service "Grafana" "http://localhost:3000"
check_service "AlertManager" "http://localhost:9093"

echo ""
echo -e "${GREEN}$SUCCESS${NC}"
echo ""
echo -e "${BLUE}$ACCESS_INFO${NC}"
echo -e "${GREEN}$GRAFANA_URL: http://localhost:3000${NC}"
echo -e "${GREEN}$PROMETHEUS_URL: http://localhost:9090${NC}"
echo -e "${GREEN}$ALERTMANAGER_URL: http://localhost:9093${NC}"
echo ""
echo -e "${YELLOW}$DEFAULT_CREDS${NC}"
echo ""
echo -e "${BLUE}Additional Endpoints:${NC}"
echo -e "${GREEN}$HEALTH_CHECK: http://localhost:5000/health${NC}"
echo -e "${GREEN}$METRICS_ENDPOINT: http://localhost:5000/metrics${NC}"
echo ""

# Display running services
echo -e "${BLUE}Running Services:${NC}"
$DOCKER_COMPOSE_CMD ps

echo ""
echo -e "${GREEN}🎉 Your EthioMarket monitoring stack is ready!${NC}"
if [ "$LANG" = "am" ]; then
    echo -e "${GREEN}🎉 የእርስዎ ኢትዮማርኬት ክትትል ስርዓት ተዘጋጅቷል!${NC}"
fi
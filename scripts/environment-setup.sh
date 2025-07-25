#!/bin/bash

# EthioMarket Environment Setup Script
# Sets up environment-specific configurations with localization support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
LANGUAGE=${2:-en}

# Translations
if [ "$LANGUAGE" = "am" ]; then
    SETTING_UP_ENV="🚀 የ$ENVIRONMENT አካባቢ ማዋቀር እየጀመረ..."
    ENV_NOT_FOUND="❌ ያልታወቀ አካባቢ: $ENVIRONMENT"
    COPYING_CONFIG="📋 የማዋቀሪያ ፋይል እየተገለበተ..."
    INSTALLING_DEPS="📦 ጥገኞች እየተጫኑ..."
    RUNNING_MIGRATIONS="🗄️  የመረጃ ቋት ሽግግር እየተሰራ..."
    SEEDING_DATA="🌱 ናሙና መረጃ እየተዘሯል..."
    STARTING_SERVICES="⚡ አገልግሎቶች እየጀመሩ..."
    SETUP_COMPLETE="✅ የ$ENVIRONMENT አካባቢ ማዋቀር ተጠናቋል!"
    FEATURES_ENABLED="🎛️  የነቃ ባህሪያት:"
    ACCESS_INFO="📊 የመዳሪያ መረጃ:"
    ERROR="❌ ስህተት:"
else
    SETTING_UP_ENV="🚀 Setting up $ENVIRONMENT environment..."
    ENV_NOT_FOUND="❌ Unknown environment: $ENVIRONMENT"
    COPYING_CONFIG="📋 Copying configuration file..."
    INSTALLING_DEPS="📦 Installing dependencies..."
    RUNNING_MIGRATIONS="🗄️  Running database migrations..."
    SEEDING_DATA="🌱 Seeding sample data..."
    STARTING_SERVICES="⚡ Starting services..."
    SETUP_COMPLETE="✅ $ENVIRONMENT environment setup complete!"
    FEATURES_ENABLED="🎛️  Enabled features:"
    ACCESS_INFO="📊 Access Information:"
    ERROR="❌ Error:"
fi

echo -e "${BLUE}$SETTING_UP_ENV${NC}"

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        ;;
    *)
        echo -e "${RED}$ENV_NOT_FOUND${NC}"
        echo "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must be run from project root${NC}"
    exit 1
fi

# Copy environment-specific configuration
echo -e "${YELLOW}$COPYING_CONFIG${NC}"
ENV_FILE="server/config/environments/${ENVIRONMENT}.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Configuration file not found: $ENV_FILE${NC}"
    exit 1
fi

# Copy to .env file
cp "$ENV_FILE" .env
echo "Copied $ENV_FILE to .env"

# Load environment variables for feature detection
export $(cat .env | grep -v '^#' | xargs)

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "${YELLOW}$INSTALLING_DEPS${NC}"
    npm install
fi

# Run database migrations
echo -e "${YELLOW}$RUNNING_MIGRATIONS${NC}"
npm run db:push

# Seed database for development and staging
if [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${YELLOW}$SEEDING_DATA${NC}"
    npx tsx scripts/seed-data.ts
fi

# Create necessary directories
mkdir -p logs uploads/listings uploads/profiles

# Set permissions for upload directories
chmod 755 uploads uploads/listings uploads/profiles

# Generate feature report
echo ""
echo -e "${GREEN}$FEATURES_ENABLED${NC}"

# Check feature toggles from environment
features=""
[ "$FEATURE_PAYMENTS" = "true" ] && features="$features payments"
[ "$FEATURE_CHAT" = "true" ] && features="$features chat"
[ "$FEATURE_MAP_SEARCH" = "true" ] && features="$features map-search"
[ "$FEATURE_IMAGE_UPLOAD" = "true" ] && features="$features image-upload"
[ "$FEATURE_FAVORITES" = "true" ] && features="$features favorites"
[ "$FEATURE_ADMIN_PANEL" = "true" ] && features="$features admin-panel"
[ "$FEATURE_ANALYTICS" = "true" ] && features="$features analytics"
[ "$FEATURE_NOTIFICATIONS" = "true" ] && features="$features notifications"

if [ -n "$features" ]; then
    for feature in $features; do
        echo -e "  ${GREEN}✓${NC} $feature"
    done
else
    echo -e "  ${YELLOW}No additional features enabled${NC}"
fi

# Display localization settings
echo ""
echo -e "${BLUE}Localization Settings:${NC}"
echo -e "  Default Language: ${DEFAULT_LANGUAGE:-en}"
echo -e "  Supported Languages: ${SUPPORTED_LANGUAGES:-en,am}"
echo -e "  RTL Support: ${ENABLE_RTL_SUPPORT:-true}"
echo -e "  Language Detection: ${LANGUAGE_DETECTION:-browser}"

# Display environment-specific information
echo ""
echo -e "${BLUE}Environment Configuration:${NC}"
echo -e "  Environment: $ENVIRONMENT"
echo -e "  Port: ${PORT:-5000}"
echo -e "  Database: $(echo $DATABASE_URL | sed 's/.*@/***@/')"
echo -e "  Log Level: ${LOG_LEVEL:-info}"
echo -e "  Rate Limiting: ${RATE_LIMIT_ENABLED:-true}"

# Payment configuration
if [ "$FEATURE_PAYMENTS" = "true" ]; then
    echo ""
    echo -e "${BLUE}Payment Configuration (Telebirr):${NC}"
    echo -e "  API URL: ${TELEBIRR_API_URL}"
    echo -e "  App ID: ${TELEBIRR_APP_ID}"
    echo -e "  Notify URL: ${TELEBIRR_NOTIFY_URL}"
fi

# Map configuration
if [ "$FEATURE_MAP_SEARCH" = "true" ]; then
    echo ""
    echo -e "${BLUE}Map Configuration:${NC}"
    echo -e "  Provider: ${MAP_PROVIDER:-osm}"
    if [ "$MAP_PROVIDER" = "google" ] && [ -n "$GOOGLE_MAPS_API_KEY" ]; then
        echo -e "  Google Maps: ${GREEN}Configured${NC}"
    elif [ "$MAP_PROVIDER" = "mapbox" ] && [ -n "$MAPBOX_ACCESS_TOKEN" ]; then
        echo -e "  Mapbox: ${GREEN}Configured${NC}"
    else
        echo -e "  OpenStreetMap: ${GREEN}Default${NC}"
    fi
fi

# Create startup script for this environment
cat > "start-${ENVIRONMENT}.sh" << EOF
#!/bin/bash
# Auto-generated startup script for $ENVIRONMENT environment

export NODE_ENV=$ENVIRONMENT

# Load environment variables
export \$(cat .env | grep -v '^#' | xargs)

# Start the application
npm run dev
EOF

chmod +x "start-${ENVIRONMENT}.sh"

echo ""
echo -e "${GREEN}$SETUP_COMPLETE${NC}"
echo ""
echo -e "${BLUE}$ACCESS_INFO${NC}"
echo -e "${GREEN}Application: http://localhost:${PORT:-5000}${NC}"

# Monitoring endpoints
if [ "$METRICS_ENABLED" = "true" ]; then
    echo -e "${GREEN}Metrics: http://localhost:${PORT:-5000}/metrics${NC}"
fi

if [ "$ERROR_TRACKING_ENABLED" = "true" ]; then
    echo -e "${GREEN}Health Check: http://localhost:${PORT:-5000}/health${NC}"
fi

# Development-specific information
if [ "$ENVIRONMENT" = "development" ]; then
    echo ""
    echo -e "${YELLOW}Development Commands:${NC}"
    echo -e "  Start application: ${GREEN}./start-development.sh${NC}"
    echo -e "  Watch logs: ${GREEN}tail -f logs/app.log${NC}"
    echo -e "  Database reset: ${GREEN}npm run db:push && npx tsx scripts/seed-data.ts${NC}"
    echo -e "  Run tests: ${GREEN}npm test${NC}"
fi

# Production warnings
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo -e "${YELLOW}Production Checklist:${NC}"
    echo -e "  ${YELLOW}⚠️${NC}  Verify all environment variables are set"
    echo -e "  ${YELLOW}⚠️${NC}  Ensure database backups are configured"
    echo -e "  ${YELLOW}⚠️${NC}  Check SSL certificates"
    echo -e "  ${YELLOW}⚠️${NC}  Verify monitoring is working"
    echo -e "  ${YELLOW}⚠️${NC}  Test error tracking and alerts"
fi

echo ""
echo -e "${GREEN}Environment setup completed successfully!${NC}"

if [ "$LANGUAGE" = "am" ]; then
    echo -e "${GREEN}የአካባቢ ማዋቀር በተሳካ ሁኔታ ተጠናቋል!${NC}"
fi
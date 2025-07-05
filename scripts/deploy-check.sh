#!/bin/bash

# Cloudflare Deployment Pre-Check Script
# Run this script to validate your environment before deploying to Cloudflare

echo "🔍 SparkMind AI Agent Platform - Cloudflare Deployment Pre-Check"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Function to check if a command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        ((ERRORS++))
    fi
}

# Function to check environment variable
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ $1 is not set${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ $1 is set${NC}"
        ((SUCCESS++))
    fi
}

# Function to check optional environment variable
check_optional_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${YELLOW}⚠️ $1 is not set (optional)${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ $1 is set${NC}"
        ((SUCCESS++))
    fi
}

echo -e "\n${BLUE}1. Checking Required Tools${NC}"
echo "----------------------------"
check_command "node"
check_command "npm"
check_command "git"

echo -e "\n${BLUE}2. Checking Node.js Version${NC}"
echo "-----------------------------"
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo -e "${GREEN}✅ Node.js version $NODE_VERSION meets requirement (>= $REQUIRED_VERSION)${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Node.js version $NODE_VERSION does not meet requirement (>= $REQUIRED_VERSION)${NC}"
    ((ERRORS++))
fi

echo -e "\n${BLUE}3. Checking Project Structure${NC}"
echo "-------------------------------"
if [ -f "apps/api/package.json" ]; then
    echo -e "${GREEN}✅ API project structure exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ API project structure missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/web/package.json" ]; then
    echo -e "${GREEN}✅ Web project structure exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Web project structure missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/api/wrangler.toml" ]; then
    echo -e "${GREEN}✅ Cloudflare Workers configuration exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Cloudflare Workers configuration missing${NC}"
    ((ERRORS++))
fi

echo -e "\n${BLUE}4. Checking GitHub Actions Configuration${NC}"
echo "----------------------------------------------"
if [ -f ".github/workflows/deploy-api.yml" ]; then
    echo -e "${GREEN}✅ API deployment workflow exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ API deployment workflow missing${NC}"
    ((ERRORS++))
fi

if [ -f ".github/workflows/deploy-full-stack.yml" ]; then
    echo -e "${GREEN}✅ Full-stack deployment workflow exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Full-stack deployment workflow missing${NC}"
    ((ERRORS++))
fi

echo -e "\n${BLUE}5. Checking Environment Variables (if .env exists)${NC}"
echo "---------------------------------------------------"
if [ -f "apps/api/.env" ]; then
    echo "Found API .env file, checking variables..."
    source apps/api/.env
    
    check_env_var "DATABASE_URL"
    check_env_var "OPENAI_API_KEY"
    check_env_var "PRIVY_APP_ID"
    check_env_var "PRIVY_APP_SECRET"
    
    check_optional_env_var "OPENAI_MODEL"
    check_optional_env_var "OPENAI_MAX_TOKENS"
    check_optional_env_var "OPENAI_TEMPERATURE"
else
    echo -e "${YELLOW}⚠️ No .env file found in apps/api/ (GitHub secrets will be used for deployment)${NC}"
    ((WARNINGS++))
fi

echo -e "\n${BLUE}6. Checking Dependencies${NC}"
echo "-------------------------"
if [ -f "apps/api/node_modules/.package-lock.json" ] || [ -f "apps/api/package-lock.json" ]; then
    echo -e "${GREEN}✅ API dependencies appear to be installed${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️ API dependencies may not be installed. Run: cd apps/api && npm install${NC}"
    ((WARNINGS++))
fi

if [ -f "apps/web/node_modules/.package-lock.json" ] || [ -f "apps/web/package-lock.json" ]; then
    echo -e "${GREEN}✅ Web dependencies appear to be installed${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️ Web dependencies may not be installed. Run: cd apps/web && npm install${NC}"
    ((WARNINGS++))
fi

echo -e "\n${BLUE}7. Testing Cloudflare Tools (if available)${NC}"
echo "--------------------------------------------"
if command -v wrangler &> /dev/null; then
    echo -e "${GREEN}✅ Wrangler CLI is available${NC}"
    ((SUCCESS++))
    
    # Check if logged in
    if wrangler whoami &> /dev/null; then
        echo -e "${GREEN}✅ Wrangler is authenticated${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️ Wrangler is not authenticated. Run: wrangler login${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️ Wrangler CLI not found (will be installed during deployment)${NC}"
    ((WARNINGS++))
fi

echo -e "\n${BLUE}8. Checking AI Agent Service${NC}"
echo "-----------------------------"
if [ -f "apps/api/src/services/aiAgentService.js" ]; then
    echo -e "${GREEN}✅ AI Agent service exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ AI Agent service missing${NC}"
    ((ERRORS++))
fi

if [ -f "apps/web/src/hooks/useAIAgentAPI.ts" ]; then
    echo -e "${GREEN}✅ Web AI Agent hook exists${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Web AI Agent hook missing${NC}"
    ((ERRORS++))
fi



echo -e "\n${BLUE}Summary${NC}"
echo "======="
echo -e "${GREEN}✅ Success: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"

echo -e "\n${BLUE}Deployment Readiness${NC}"
echo "===================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Your environment appears ready for Cloudflare deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub secrets (see DEPLOYMENT.md)"
    echo "2. Push changes to main/develop branch"
    echo "3. Monitor GitHub Actions for deployment status"
    echo ""
    echo "Or deploy manually:"
    echo "- API: cd apps/api && npm run deploy"
    echo "- Web: cd apps/web && npm run build:cf && npm run deploy"
else
    echo -e "${RED}🚨 Please fix the errors above before deploying${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Install missing tools: node, npm, git"
    echo "- Install dependencies: npm install"
    echo "- Set environment variables in .env files"
    echo "- Check project structure and file locations"
fi

if [ $WARNINGS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}ℹ️ Note: Warnings won't prevent deployment but should be addressed for optimal setup${NC}"
fi

echo ""
echo "📚 For detailed setup instructions, see: DEPLOYMENT.md"
echo "🆘 For troubleshooting, see: DEPLOYMENT.md#troubleshooting" 
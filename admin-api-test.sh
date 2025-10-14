#!/bin/bash
# Admin API Test Script
# This script tests the admin API endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Srichakra Admin API Test ====${NC}"
echo "Testing admin API endpoints..."

# Base URL - change this to your deployment URL if needed
# For local testing:
BASE_URL="http://localhost:5000"
# For Vercel testing:
# BASE_URL="https://your-vercel-app.vercel.app"

# Check if jq is installed
if ! command -v jq &> /dev/null
then
    echo -e "${RED}jq not found. Please install jq to parse JSON responses.${NC}"
    echo "You can install it with: brew install jq"
    exit 1
fi

# Test login status endpoint
echo -e "\n${BLUE}Testing login status endpoint...${NC}"
LOGIN_STATUS=$(curl -s "$BASE_URL/api/admin/login-status")
echo "$LOGIN_STATUS" | jq .

if echo "$LOGIN_STATUS" | jq -e '.success' &> /dev/null; then
    echo -e "${GREEN}✓ Login status endpoint working${NC}"
else
    echo -e "${RED}✗ Login status endpoint failed${NC}"
fi

# Test login endpoint with test credentials
echo -e "\n${BLUE}Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@srichakra.com","password":"admin123"}' \
    "$BASE_URL/api/admin/login")
echo "$LOGIN_RESPONSE" | jq .

if echo "$LOGIN_RESPONSE" | jq -e '.token' &> /dev/null; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    
    # Test online users endpoint with token
    echo -e "\n${BLUE}Testing online users endpoint...${NC}"
    USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/admin/online-users")
    echo "$USERS_RESPONSE" | jq .
    
    if echo "$USERS_RESPONSE" | jq -e '.success' &> /dev/null; then
        echo -e "${GREEN}✓ Online users endpoint working${NC}"
    else
        echo -e "${RED}✗ Online users endpoint failed${NC}"
    fi
    
    # Test profile endpoint with token
    echo -e "\n${BLUE}Testing profile endpoint...${NC}"
    PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/admin/profile")
    echo "$PROFILE_RESPONSE" | jq .
    
    if echo "$PROFILE_RESPONSE" | jq -e '.success' &> /dev/null; then
        echo -e "${GREEN}✓ Profile endpoint working${NC}"
    else
        echo -e "${RED}✗ Profile endpoint failed${NC}"
    fi
    
    # Test logout endpoint with token
    echo -e "\n${BLUE}Testing logout endpoint...${NC}"
    LOGOUT_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/admin/logout")
    echo "$LOGOUT_RESPONSE" | jq .
    
    if echo "$LOGOUT_RESPONSE" | jq -e '.success' &> /dev/null; then
        echo -e "${GREEN}✓ Logout endpoint working${NC}"
    else
        echo -e "${RED}✗ Logout endpoint failed${NC}"
    fi
else
    echo -e "${RED}✗ Login failed, cannot test authenticated endpoints${NC}"
fi

echo -e "\n${BLUE}==== Test Complete ====${NC}"

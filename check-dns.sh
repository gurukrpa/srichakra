#!/bin/bash

# Namecheap DNS Configuration for srichakraacademy.org
# Run this to check if DNS is configured correctly

echo "====================================="
echo "Checking DNS for srichakraacademy.org"
echo "====================================="
echo ""

echo "1. Checking A Records for root domain (@):"
dig A srichakraacademy.org +short
echo ""

echo "2. Checking A Records for www subdomain:"
dig A www.srichakraacademy.org +short
echo ""

echo "3. Checking TXT Record (Firebase verification):"
dig TXT srichakraacademy.org +short
echo ""

echo "4. Checking CNAME for www:"
dig CNAME www.srichakraacademy.org +short
echo ""

echo "5. Testing HTTP redirect:"
curl -I -L http://srichakraacademy.org 2>&1 | grep -E "(HTTP|Location)"
echo ""

echo "6. Testing HTTPS:"
curl -I https://srichakraacademy.org 2>&1 | grep -E "(HTTP|Location)" | head -5
echo ""

echo "====================================="
echo "DNS Propagation Check:"
echo "Visit: https://www.whatsmydns.net/#A/srichakraacademy.org"
echo "====================================="

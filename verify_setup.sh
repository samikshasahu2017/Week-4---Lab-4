#!/bin/bash
# Simple script to verify the Node.js application and tests work

cd /workspaces/Week-4---Lab-4/src/accounting

echo "======================================"
echo "STEP 1: Running Node.js Application"
echo "======================================"
echo ""
echo "Input: 1 (View Balance), 4 (Exit)"
echo ""
echo -e "1\n4" | node index.js 2>&1 | head -30
echo ""
echo ""

echo "======================================"
echo "STEP 2: Running Jest Test Suite"
echo "======================================"
echo ""
npm test -- --noStackTrace 2>&1 | tail -60
echo ""

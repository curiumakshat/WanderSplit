#!/bin/bash

# Wait a moment for server to start
sleep 2

echo "Testing Expenses API Endpoints"
echo "=============================="
echo ""

# Test 1: Get members for trip 1
echo "1. GET /api/trips/1/members"
curl -s http://localhost:3001/api/trips/1/members | jq '.' || echo "Failed or jq not available"
echo ""

# Test 2: Add an expense
echo "2. POST /api/trips/1/expenses"
curl -s -X POST http://localhost:3001/api/trips/1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test Expense",
    "amount": 1000,
    "paid_by": 1,
    "split_with": [1, 2, 3],
    "category": "Food",
    "date": "2026-04-14"
  }' | jq '.' || echo "Failed or jq not available"
echo ""

# Test 3: Get all expenses
echo "3. GET /api/trips/1/expenses"
curl -s http://localhost:3001/api/trips/1/expenses | jq '.' || echo "Failed or jq not available"
echo ""

# Test 4: Get balances
echo "4. GET /api/trips/1/balances"
curl -s http://localhost:3001/api/trips/1/balances | jq '.' || echo "Failed or jq not available"
echo ""

echo "Tests complete!"

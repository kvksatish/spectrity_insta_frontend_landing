#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvdWFpZ3MxYnF1eHFwam4xYmxlMGo3cmciLCJlbWFpbCI6Imt2a3NhdGlzaDk4LnN0YXJsaW5rQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwic2Vzc2lvbklkIjoiazhobHlqejZzeTZodnp0ZzIzN3RycWVwIiwiaWF0IjoxNzY2MDc2ODk0LCJleHAiOjE3Njg2Njg4OTQsImF1ZCI6Imh0dHA6Ly9zcGVjdHJpdHkuY29tIiwiaXNzIjoic3BlY3RyaXR5LWluc3RhLWNvcmUifQ.rKuZXbUhxEHRJ19O3RDQYOvJMH6ieFXRqktt4dcibsQ"

echo "Testing dev token with backend API..."
echo "Token: ${TOKEN:0:50}..."
echo ""

curl -X GET "https://spectrity.com/api/v1/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

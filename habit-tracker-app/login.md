## FEATURE:

- Implement screen allow user can login and register.
- Implement screen allow user can logout.
- refresh token automatically when access token expires.

## EXAMPLES:

## DOCUMENTATION:

API already have all needed features.

```
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Expected:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "user": { "id": "...", "email": "test@example.com", "name": "Test User" }
# }

# Test 2: Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: Same response structure as signup

# Test 3: Access protected route (habits)
# Replace YOUR_ACCESS_TOKEN with token from login/signup
curl -X GET http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: Array of habits (may be empty)

# Test 4: Access without token (should fail)
curl -X GET http://localhost:3000/habits

# Expected: 401 Unauthorized

# Test 5: Refresh token
# Replace YOUR_REFRESH_TOKEN with refresh token from login/signup
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Expected: New access token and refresh token

# Test 6: Logout
# Replace tokens with actual values
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Expected: 204 No Content

# Test 7: Try to use revoked refresh token (should fail)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REVOKED_REFRESH_TOKEN"
  }'

# Expected: 401 Unauthorized
```

## OTHER CONSIDERATIONS:

- Make awesome UI

// Test API URL manually in browser console or Postman

const testApiUrls = [
'http://testapi.mdgroup.id/api/v1/login',
'http://192.168.1.100:8000/api/v1/login', // contoh URL lokal
'https://your-domain.com/api/v1/login' // contoh URL production
];

// Test each URL with curl or Postman:
/_
curl -X POST \
 http://your-api-url/api/v1/login \
 -H 'Content-Type: application/json' \
 -H 'Accept: application/json' \
 -d '{
"email": "test@example.com",
"password": "password"
}'
_/

// Expected responses:
// - 401: Wrong credentials (but server accepts POST) ✅
// - 422: Validation error (but server accepts POST) ✅  
// - 405: Method not allowed (server rejects POST) ❌
// - 404: Endpoint not found ❌

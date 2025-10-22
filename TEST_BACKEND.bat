@echo off
echo Testing XAPE Backend...
echo.
echo Sending test snapshot...
curl -X POST http://localhost:3000/api/coins/snapshot -H "Content-Type: application/json" -d "{\"userId\":\"test_user\",\"coins\":[{\"name\":\"TestCoin\",\"marketCap\":\"100K\",\"holders\":50}],\"timestamp\":1699999999999}"
echo.
echo.
echo Testing chat endpoint...
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"userId\":\"test_user\",\"message\":\"hello\"}"
echo.
pause



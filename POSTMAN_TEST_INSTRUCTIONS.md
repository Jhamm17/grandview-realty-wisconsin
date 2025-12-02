# Testing MLS Aligned API with Postman

## Setup Instructions

### 1. Create a New Request
- Method: **GET**
- URL: `http://aligned.metromls.com/RESO/OData/Property`

### 2. Configure Headers
Go to the **Headers** tab and add these headers in this exact order:

| Key | Value |
|-----|-------|
| `MLS-Aligned-User-Agent` | `Jackson Hamm Consultant` |
| `Authorization` | `Bearer 5c2c090337adb399331a3f4b94e6fdee` |
| `OUID` | `M00000662` |
| `Accept` | `application/json` |

### 3. Add Query Parameters
Go to the **Params** tab and add:

| Key | Value | Description |
|-----|-------|-------------|
| `$filter` | `MlsStatus eq 'Active'` | Filter for active listings |
| `$top` | `10` | Limit to 10 results (max 25) |
| `$count` | `true` | Include total count |
| `$orderby` | `ModificationTimestamp desc` | Order by most recent |
| `$expand` | `Media` | Include media/images |

### 4. Example Full URL
After adding params, your URL should look like:
```
http://aligned.metromls.com/RESO/OData/Property?$filter=MlsStatus%20eq%20%27Active%27&$top=10&$count=true&$orderby=ModificationTimestamp%20desc&$expand=Media
```

## Test Cases

### Test 1: Simple Active Listings Query
**URL:** `http://aligned.metromls.com/RESO/OData/Property`
**Params:**
- `$filter`: `MlsStatus eq 'Active'`
- `$top`: `5`
- `$count`: `true`

**Expected Response:**
- Status: `200 OK`
- Content-Type: `application/json`
- Body should contain `@odata.context`, `@odata.count`, and `value` array with property data

### Test 2: Metadata Request
**URL:** `http://aligned.metromls.com/RESO/OData/$metadata`
**Headers:**
- Change `Accept` to: `application/xml` (required for metadata)
- Keep all other headers the same

**Expected Response:**
- Status: `200 OK`
- Content-Type: `application/xml` or `text/xml`
- XML metadata document

### Test 3: Get Single Property by ListingKey
**URL:** `http://aligned.metromls.com/RESO/OData/Property('[ListingKey]')`
**Replace `[ListingKey]`** with an actual listing ID from Test 1

**Expected Response:**
- Status: `200 OK`
- Single property object

## Common Errors

### Error: `{ "status": "error", "msg": "Invalid Authentication Headers" }`
- **Cause:** Missing one of the 4 required headers
- **Fix:** Ensure all headers are present and spelled correctly

### Error: `{ "status": "error", "msg": "Invalid Token" }`
- **Cause:** Token is invalid or expired
- **Fix:** Verify token with clambrou@metromls.com

### Error: `{ "status": "error", "msg": "Invalid OUID Header" }`
- **Cause:** OUID doesn't match token permissions
- **Fix:** Verify OUID `M00000662` is authorized for your token

### Error: `{ "status": "error", "msg": "Call Exceeds Max Allowed $top of 25" }`
- **Cause:** `$top` parameter is greater than 25
- **Fix:** Set `$top` to 25 or less

## Postman Collection Setup

### Option 1: Manual Setup
1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to **GET**
4. Enter URL: `http://aligned.metromls.com/RESO/OData/Property`
5. Add headers as shown above
6. Add query parameters as shown above

### Option 2: Import from cURL
You can also use this cURL command and import it:

```bash
curl -X GET "http://aligned.metromls.com/RESO/OData/Property?$filter=MlsStatus%20eq%20%27Active%27&$top=5&$count=true" \
  -H "MLS-Aligned-User-Agent: Jackson Hamm Consultant" \
  -H "Authorization: Bearer 5c2c090337adb399331a3f4b94e6fdee" \
  -H "OUID: M00000662" \
  -H "Accept: application/json"
```

In Postman:
1. Click "Import"
2. Select "Raw text"
3. Paste the cURL command
4. Click "Import"

## Verification Checklist

Before sending the request, verify:
- ✅ Method is **GET**
- ✅ URL is `http://aligned.metromls.com/RESO/OData/Property`
- ✅ All 4 headers are present and correct
- ✅ Headers are in the correct order (optional but recommended)
- ✅ Token is exactly: `5c2c090337adb399331a3f4b94e6fdee` (no extra spaces)
- ✅ OUID is exactly: `M00000662`
- ✅ User-Agent is exactly: `Jackson Hamm Consultant` (no quotes in Postman)
- ✅ `$top` is 25 or less

## Troubleshooting

If you get a 401 error:
1. Double-check all header names (case-sensitive)
2. Verify token has no extra spaces or characters
3. Try removing and re-adding headers
4. Check if Postman is adding any extra headers automatically

If you get a 404 error:
1. Verify the URL is correct
2. Check if the endpoint path is correct (should be `/Property` not `/property`)

If you get a timeout:
1. Check your internet connection
2. Verify the endpoint is accessible: `http://aligned.metromls.com/RESO/OData/`


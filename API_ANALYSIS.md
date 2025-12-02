# Wisconsin MLS API - Comprehensive Analysis & Implementation

## Overview
This document provides a comprehensive analysis of the Wisconsin MLS API implementation, which uses the RESO OData API from Metro MLS.

## API Structure

### Base URL
- **Endpoint**: `http://aligned.metromls.com/RESO/OData`
- **Protocol**: HTTP (not HTTPS)
- **Format**: RESO OData v4

### Authentication Headers
All API requests require the following headers in this exact order:

```javascript
{
  'MLS-Aligned-User-Agent': '<your application name>',
  'Authorization': 'Bearer <your access key>',
  'OUID': '<the RESO OUID of the MLS>',
  'Accept': 'application/json'
}
```

### Environment Variables
The following environment variables correspond to the headers above:

1. **MLS-Aligned-User-Agent** → `MLS-Aligned-User-Agent` or `WISCONSIN_MLS_APP_NAME`
2. **Authorization** → `WISCONSIN_MLS_ACCESS_TOKEN`
3. **OUID** → `WISCONSIN_MLS_OUID`
4. **Accept** → Always `application/json` (hardcoded)

## API Endpoints

### 1. Property Queries

#### Get All Properties with Filters
```
GET http://aligned.metromls.com/RESO/OData/Property/?$filter=<filter_expression>
```

**Example with Date Filter:**
```
GET http://aligned.metromls.com/RESO/OData/Property/?$filter=year(ModificationTimestamp) eq 2018 and month(ModificationTimestamp) eq 8 and day(ModificationTimestamp) eq 2 and hour(ModificationTimestamp) eq 5
```

**OData Query Parameters:**
- `$filter`: Filter expression using OData syntax
- `$top`: Maximum number of results (max 25 per request)
- `$skip`: Number of results to skip (for pagination)
- `$count`: Include total count in response
- `$orderby`: Sort order (e.g., `ModificationTimestamp desc`)
- `$select`: Comma-separated list of fields to return
- `$expand`: Related entities to include (e.g., `Media`)

#### Get Single Property
```
GET http://aligned.metromls.com/RESO/OData/Property('[ListingKey]')
```

**Example:**
```
GET http://aligned.metromls.com/RESO/OData/Property('12345')
```

### 2. Media Queries

#### Get Media for a Property
```
GET http://aligned.metromls.com/RESO/OData/Property('[ListingKey]')/Media
```

**Example:**
```
GET http://aligned.metromls.com/RESO/OData/Property('12345')/Media
```

**Response Format:**
```json
{
  "value": [
    {
      "MediaKey": "string",
      "MediaURL": "string",
      "Order": 1,
      "ModificationTimestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Current Implementation

### File Structure
```
src/lib/wisconsin-mls/
├── config.ts      # Configuration and environment variables
├── auth.ts        # Authentication header management
└── api.ts         # API service implementation
```

### Key Components

#### 1. Configuration (`config.ts`)
- **API_BASE_URL**: Defaults to `http://aligned.metromls.com/RESO/OData`
- **ACCESS_TOKEN**: From `WISCONSIN_MLS_ACCESS_TOKEN`
- **OUID**: From `WISCONSIN_MLS_OUID` (defaults to `M00000662`)
- **APP_NAME**: From `MLS-Aligned-User-Agent` or `WISCONSIN_MLS_APP_NAME`

#### 2. Authentication (`auth.ts`)
- Provides `getAuthHeaders()` method that returns properly formatted headers
- Ensures all required headers are present

#### 3. API Service (`api.ts`)
- **fetchFromAPI()**: Core method for making API requests
- **getProperty()**: Get single property by ListingKey
- **getPropertyMedia()**: Get media for a property
- **searchProperties()**: Search with filters and pagination
- **getAllProperties()**: Fetch all properties with pagination (handles 25 record limit)

### OData Filter Syntax

#### Date Filters
The API supports OData date functions:
- `year(ModificationTimestamp) eq 2018`
- `month(ModificationTimestamp) eq 8`
- `day(ModificationTimestamp) eq 2`
- `hour(ModificationTimestamp) eq 5`

**Combined Example:**
```
$filter=year(ModificationTimestamp) eq 2018 and month(ModificationTimestamp) eq 8 and day(ModificationTimestamp) eq 2 and hour(ModificationTimestamp) eq 5
```

#### Property Filters
- `MlsStatus eq 'Active'` - Filter by status
- `City eq 'Milwaukee'` - Filter by city
- `ListPrice ge 100000` - Greater than or equal
- `ListPrice le 500000` - Less than or equal
- `BedroomsTotal eq 3` - Exact match
- `PropertyType eq 'Residential'` - Property type

#### Combining Filters
Use `and` to combine multiple filters:
```
$filter=MlsStatus eq 'Active' and City eq 'Milwaukee' and ListPrice ge 100000
```

## Rate Limiting

- **Max Requests Per Second**: 2.0
- **Max Records Per Request**: 25
- **Pagination**: Required for large result sets using `$skip` and `$top`

## Error Handling

The API returns errors in various formats:

1. **Standard Format:**
```json
{
  "status": "error",
  "msg": "Error message"
}
```

2. **Alternative Format:**
```json
{
  "response_code": 401,
  "message": "Invalid Credentials"
}
```

## Data Flow

1. **Request Flow:**
   - Client calls API service method
   - Service constructs OData URL with query parameters
   - Service adds required headers via `auth.ts`
   - Request sent to Metro MLS API
   - Response parsed and returned

2. **Media Flow:**
   - Property data fetched with `$expand=Media` or separately
   - Media URLs processed through proxy if needed
   - Images cached in Supabase

3. **Caching:**
   - Properties cached in Supabase `property_cache` table
   - Cache duration: 24 hours
   - Media cached separately with 7-day TTL

## Recent Updates

### Changes Made:
1. ✅ Updated base URL to use `http://aligned.metromls.com/RESO/OData`
2. ✅ Added support for `MLS-Aligned-User-Agent` environment variable
3. ✅ Added `getPropertyMedia()` method for fetching media
4. ✅ Improved OData URL construction
5. ✅ Added date filter support using OData date functions
6. ✅ Updated all API calls to use environment variable for app name

### Environment Variables Required:
```bash
# Required
WISCONSIN_MLS_ACCESS_TOKEN=<your_access_token>
WISCONSIN_MLS_OUID=M00000662

# Optional (with defaults)
NEXT_PUBLIC_WISCONSIN_MLS_API_URL=http://aligned.metromls.com/RESO/OData
MLS-Aligned-User-Agent=<your_app_name>
# OR
WISCONSIN_MLS_APP_NAME=<your_app_name>
```

## Testing

### Test Property Query
```bash
curl -X GET "http://aligned.metromls.com/RESO/OData/Property/?\$top=5" \
  -H "MLS-Aligned-User-Agent: <your_app_name>" \
  -H "Authorization: Bearer <your_token>" \
  -H "OUID: M00000662" \
  -H "Accept: application/json"
```

### Test Media Query
```bash
curl -X GET "http://aligned.metromls.com/RESO/OData/Property('[ListingKey]')/Media" \
  -H "MLS-Aligned-User-Agent: <your_app_name>" \
  -H "Authorization: Bearer <your_token>" \
  -H "OUID: M00000662" \
  -H "Accept: application/json"
```

## Notes

- The API uses HTTP (not HTTPS) for the base URL
- Maximum 25 records per request - pagination required
- All dates in OData filters use UTC
- Media URLs may need proxy for CORS issues
- Back broker access provides full Property and Media data access


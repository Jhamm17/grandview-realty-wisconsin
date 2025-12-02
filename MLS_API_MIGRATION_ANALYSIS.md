# MLS API Migration Analysis: MLSGrid → MLS Aligned API

## Executive Summary

We're migrating from **MLSGrid/MRED API** (Chicagoland) to **MLS Aligned API** (Wisconsin Metro MLS). This document outlines the key differences and required changes.

## API Comparison

### Current API: MLSGrid/MRED
- **Endpoint**: `https://api.mlsgrid.com/v2`
- **Authentication**: OAuth2 Bearer token only
- **Headers Required**:
  - `Authorization: Bearer <token>`
  - `Accept: application/json`
- **Pagination**: 100 records per page
- **Rate Limit**: 2 requests per second
- **Filter Field**: `MlgCanView eq true` (MLSGrid-specific)

### New API: MLS Aligned (Metro MLS)
- **Endpoint**: `http://aligned.metromls.com/RESO/OData/`
- **Authentication**: OAuth2 Bearer token + OUID header
- **Headers Required**:
  - `Authorization: Bearer <token>`
  - `Accept: application/json`
  - `OUID: M00000662` (Metro MLS RESO OUID) ⚠️ **NEW**
  - `MLS-Aligned-User-Agent: <application name>` ⚠️ **NEW**
- **Pagination**: **25 records per page MAX** ⚠️ **CRITICAL CHANGE**
- **Rate Limit**: Not specified (may need testing)
- **Filter Field**: Standard RESO fields (need to verify `MlgCanView` equivalent)

## Critical Changes Required

### 1. Configuration Updates

**File**: `src/lib/mred/config.ts` (or create new `wisconsin-mls/config.ts`)

**Changes**:
- Update API base URL to `http://aligned.metromls.com/RESO/OData/`
- Change `RECORDS_PER_PAGE` from 100 to **25**
- Add OUID configuration: `M00000662` (Metro MLS)
- Add application name for User-Agent header
- Update environment variable names

### 2. Authentication Updates

**File**: `src/lib/mred/auth.ts` (or create new `wisconsin-mls/auth.ts`)

**Changes**:
- Add `OUID` header to all requests
- Add `MLS-Aligned-User-Agent` header to all requests
- Keep Bearer token authentication

### 3. API Service Updates

**File**: `src/lib/mred/api.ts` (or create new `wisconsin-mls/api.ts`)

**Changes**:
- Update `fetchFromAPI` method to include all 4 required headers
- Update pagination logic (max 25 per request instead of 100)
- Update filter field (remove `MlgCanView` if not available in RESO standard)
- Update endpoint URL construction

### 4. Property Cache Service Updates

**File**: `src/lib/property-cache.ts`

**Changes**:
- Update `$top` parameter from 100 to 25
- Update pagination logic to handle smaller page sizes
- Update filter queries (remove `MlgCanView` if needed)
- Update API base URL references

### 5. Cron Job Updates

**File**: `src/app/api/cron/daily-update/route.ts`

**Changes**:
- Update authentication headers
- Update API endpoint
- Update pagination limits

### 6. Environment Variables

**Add to `.env.local`**:
```env
WISCONSIN_MLS_ACCESS_TOKEN=<your_access_token>
WISCONSIN_MLS_OUID=M00000662
WISCONSIN_MLS_API_URL=http://aligned.metromls.com/RESO/OData/
WISCONSIN_MLS_APP_NAME=Grandview Realty Wisconsin
```

## Field Mapping Considerations

### Filter Fields
- **Current**: `MlgCanView eq true` (MLSGrid-specific)
- **New**: May need to use standard RESO field or remove filter
- **Action**: Test with/without filter to see what works

### Response Fields
- Both APIs use RESO/OData standard
- Response format should be similar: `{ value: [...], '@odata.count': ..., '@odata.nextLink': ... }`
- Field names should be RESO standard (should be compatible)

## Pagination Impact

### Current Implementation
- Fetches 100 properties per request
- Example: 1000 properties = 10 requests

### New Implementation
- Fetches 25 properties per request
- Example: 1000 properties = **40 requests** ⚠️
- **Impact**: 4x more API calls needed for same data
- **Solution**: Implement efficient pagination with proper rate limiting

## Error Handling

### MLS Aligned Error Responses
According to documentation:
```json
{ "status": "error", "msg": "Invalid Authentication Headers" }
{ "status": "error", "msg": "Invalid OUID Header" }
{ "status": "error", "msg": "Invalid Token" }
{ "status": "error", "msg": "Invalid/Bad OData Call" }
{ "status": "error", "msg": "Call Exceeds Max Allowed $top of 25" }
{ "status": "error", "msg": "System Error" }
```

**Action**: Update error handling to check for these specific error formats.

## Testing Checklist

- [ ] Test authentication with OUID header
- [ ] Test single property fetch
- [ ] Test property search with filters
- [ ] Test pagination (verify 25 max)
- [ ] Test error handling
- [ ] Verify field names match expected format
- [ ] Test rate limiting (if applicable)
- [ ] Test metadata endpoint (`$metadata`)

## Implementation Strategy

### Option A: Replace Existing Code
- Update `src/lib/mred/` files directly
- Pros: Simpler, fewer files
- Cons: Loses Illinois functionality

### Option B: Create Parallel Structure (Recommended)
- Create `src/lib/wisconsin-mls/` folder
- Copy structure from `mred/` but update for MLS Aligned
- Update references throughout codebase
- Pros: Keeps Illinois code intact, clearer separation
- Cons: More files to manage

**Recommendation**: Option B - Create parallel structure for clarity and maintainability.

## Files to Create/Update

### New Files (Option B)
1. `src/lib/wisconsin-mls/config.ts` - Wisconsin MLS configuration
2. `src/lib/wisconsin-mls/auth.ts` - Authentication with OUID
3. `src/lib/wisconsin-mls/api.ts` - API service class
4. `src/lib/wisconsin-mls/types.ts` - TypeScript types (can reuse from mred)

### Files to Update
1. `src/lib/property-cache.ts` - Update to use Wisconsin MLS service
2. `src/app/api/cron/daily-update/route.ts` - Update cron job
3. `.env.local` / `env.wisconsin.example` - Add new environment variables

## Next Steps

1. ✅ Create Wisconsin MLS service structure
2. ✅ Update configuration for MLS Aligned API
3. ✅ Update authentication headers
4. ✅ Update API service with new headers and pagination
5. ✅ Update property cache service
6. ✅ Update cron jobs
7. ✅ Test with actual API credentials
8. ✅ Update environment variables documentation

---

**Reference**: [MLS Aligned API Documentation](http://aligned.metromls.com/info/)


// RESO Data Dictionary Standard Fields
export interface Media {
  MediaKey: string;
  MediaURL: string;
  Order: number;
  ModificationTimestamp?: string;
  MediaCategory?: string;
  Permission?: string[];
  LongDescription?: string;
  ShortDescription?: string;
  PreferredPhotoYN?: boolean;
  MediaHTML?: string;
  OriginatingSystemMediaKey?: string;
  ResourceRecordID?: string;
  ResourceRecordKey?: string;
}

export interface Property {
  // Required MLS Grid fields
  ListingId: string;
  ListingKey: string;
  ModificationTimestamp: string;
  OriginatingSystemName: string;
  StandardStatus?: string; // Optional - may be null, use MlsStatus as fallback
  MlsStatus?: string; // Primary status field from API
  StandardName?: string;
  MlgCanView?: boolean; // Optional - may not be in API response

  // Common Property Fields
  PropertyType?: string;
  PropertySubType?: string;
  ListPrice: number;
  UnparsedAddress?: string;
  StreetNumber?: string;
  StreetName?: string;
  StreetSuffix?: string;
  City: string;
  StateOrProvince?: string; // Optional - may be null
  PostalCode: string;
  CountyOrParish?: string;
  BedroomsTotal?: number; // Optional - may be null
  BathroomsTotalInteger?: number; // Optional - may be null
  LivingArea?: number; // Optional - use BuildingAreaTotal as fallback
  BuildingAreaTotal?: number; // API field - use when LivingArea is null
  LotSize?: string;
  YearBuilt?: number;

  // Media
  Media?: Media[];

  // Listing Details
  ListingContractDate?: string;
  CloseDate?: string;
  ListingTerms?: string;
  Financing?: string[];
  ShowingInstructions?: string;
  Ownership?: string;
  PropertyCondition?: string;
  PrivateRemarks?: string;

  // Additional Features
  Appliances?: string[];
  ArchitecturalStyle?: string[];
  CommunityFeatures?: string[];
  ConstructionMaterials?: string[];
  Cooling?: string[];
  Heating?: string[];
  InteriorFeatures?: string[];
  ExteriorFeatures?: string[];
  ParkingFeatures?: string[];
  WaterFrontFeatures?: string[];
  Utilities?: string[];
  Zoning?: string;

  // Financial
  AssociationFee?: number;
  AssociationFeeFrequency?: string;
  TaxAnnualAmount?: number;
  TaxYear?: number;

  // Agent Information
  ListAgentFullName?: string;
  ListAgentEmail?: string;
  ListAgentDirectPhone?: string;
  ListAgentMlsId?: string;
  ListAgentKey?: string;
  ListOfficeName?: string;
  ListOfficeMlsId?: string;
  ListOfficeKey?: string;
  
  // Additional fields from API that may be useful
  Latitude?: number;
  Longitude?: number;
  LotSizeAcres?: number;
  LotSizeSquareFeet?: number;
  GarageSpaces?: number;
  GarageType?: string;
  GarageYN?: boolean;
  FireplacesTotal?: number;
  Basement?: string;
  Roof?: string;
  Heating?: string;
  Cooling?: string;
  Sewer?: string;
  WaterSource?: string;
  PublicRemarks?: string; // Make optional since it may be empty
}

export interface PropertyPhoto {
    MediaURL: string;
    MediaType: string;
    Order: number;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export interface SearchParams {
    // Standard Search Parameters
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    status?: string;
    propertyType?: string;
    
    // MLS Grid Pagination
    top?: number;
    skip?: number;
    count?: boolean;
    
    // MLS Grid Filtering
    filter?: string;
    select?: string[];
    orderby?: string;
    
    // Sync Parameters
    modifiedSince?: Date;
}

export interface MREDAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// MLS Grid Response Types
export interface MLSGridResponse<T> {
    value: T[];
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
} 
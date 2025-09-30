import { Property } from './mred/types';

export class ClientPropertyService {
  // Get all properties from the public API
  static async getAllProperties(): Promise<Property[]> {
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Get a single property from the public API
  static async getProperty(listingId: string): Promise<Property | null> {
    try {
      const response = await fetch(`/api/properties/${listingId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.property || null;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  // Get under contract properties from the public API
  static async getUnderContractProperties(): Promise<Property[]> {
    try {
      const response = await fetch('/api/properties/under-contract');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching under contract properties:', error);
      return [];
    }
  }
} 
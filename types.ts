
// Fix: Added missing Attraction interface
export interface Attraction {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  image?: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price?: number;
  date: string;
  ticketUrl?: string;
  type: 'departure' | 'return';
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerPerson: number;
  currency: string;
  address: string;
  pros: string[];
  cons: string[];
  images: string[];
  isSelected: boolean;
  url?: string;
}

export interface ItineraryItem {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  activity: string;
  location: string;
  locationUrl?: string;
  type: 'attraction' | 'food' | 'transport' | 'rest';
  transportation?: string;
  note?: string;
  attachment?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  isChecked: boolean;
  itineraryItemId?: string;
  forWhom: string;
  image?: string;
}

export interface DebtItem {
  id: string;
  description: string;
  amount: number;
  currency: string; // Added currency to keep original input
  payer: string;
  date: string;
}

export interface ArchivedTrip {
  id: string;
  timestamp: number;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  data: any; // Full data snapshot
}

// Fix: Removed 'explore'
export type ViewType = 'dashboard' | 'flights' | 'hotels' | 'itinerary' | 'shopping';

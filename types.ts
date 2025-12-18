
export interface ServiceProduct {
  id: number;
  title: string;
  description: string;
  shortDesc?: string;
  icon: string; // Base64 or ID from IndexedDB
  caseImages: string[];
  highlights: string[];
  serviceType: string;
  pricingModel: string;
  price: string;
  contactInfo?: string;
  featureTags: string[];
  category: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author?: string;
  version?: string;
}

export interface FeaturedContent {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string; // Cover image
  images: string[];
  author?: string;
  publishDate?: string;
  isPublished: boolean;
  sortOrder: number;
  recommendedServices: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark';

export interface AdminSettings {
  servicesPageSize: string;
  servicesDefaultSort: string;
  servicesDefaultSortOrder: 'asc' | 'desc';
  showServiceIcon: boolean;
  showServiceDescription: boolean;
  showServiceTags: boolean;
  tableDensity: 'compact' | 'normal' | 'comfortable';
}

export interface PremiumPlan {
  type: 'FREE' | 'PREMIUM';
  name: string;
  price: string;
  benefits: string[];
}

export interface PremiumStatus {
  userId: number;
  isPremium: boolean;
  planType: string;
  status: string;
  renewalDate?: string;
}

export interface SubscriptionRequest {
  paymentMethod: string;
  planType?: string;
}

export interface SubscriptionResponse {
  userId: number;
  status: string;
  planType: string;
  message: string;
  benefits: string[];
}
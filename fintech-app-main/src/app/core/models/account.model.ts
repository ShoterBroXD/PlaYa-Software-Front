// ===== REQUEST =====
export interface AccountRequest {
  accountNumber: string;
  initialBalance: number;
}

// ===== RESPONSE =====
export interface AccountResponse {
  id: string;
  accountNumber: string;
  customerId: string;
  customerName: string;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

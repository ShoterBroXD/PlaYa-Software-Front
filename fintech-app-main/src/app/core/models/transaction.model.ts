// ===== ENUMS =====
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW'
}

// ===== REQUEST =====
export interface TransactionRequest {
  accountNumber: string;
  type: TransactionType;
  amount: number;
  description?: string;
}

// ===== RESPONSE =====
export interface TransactionResponse {
  id: string;
  accountNumber: string;
  accountOwner: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  timestamp: string;
  description?: string;
}

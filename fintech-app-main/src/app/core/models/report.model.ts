export interface TransactionByTypeDTO {
  type: 'DEPOSIT' | 'WITHDRAW';
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface TransactionReportRequest {
  startDate: string;
  endDate: string;
}

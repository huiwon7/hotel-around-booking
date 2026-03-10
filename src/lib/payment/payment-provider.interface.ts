export interface PreparePaymentData {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
}

export interface PaymentResult {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: "success" | "failed";
}

export interface PaymentInfo {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  paidAt?: string;
}

export interface IPaymentProvider {
  preparePayment(
    data: PreparePaymentData
  ): Promise<{ paymentKey: string; redirectUrl?: string }>;

  confirmPayment(data: {
    paymentKey: string;
    orderId: string;
    amount: number;
  }): Promise<PaymentResult>;

  cancelPayment(paymentKey: string, reason: string): Promise<boolean>;

  getPayment(paymentKey: string): Promise<PaymentInfo>;
}

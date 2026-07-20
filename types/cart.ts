export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;

  defaultPaymentMethod: string;

requireFullPayment: boolean;

mpesaEnvironment: string;

mpesaShortcode: string;

mpesaTillNumber: string;

mpesaConsumerKey: string;

mpesaConsumerSecret: string;

mpesaPasskey: string;

mpesaCallbackUrl: string;

mpesaAutoVerify: boolean;
}


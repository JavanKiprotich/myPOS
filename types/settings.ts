export interface Settings {
  // Store
  businessName: string;
  phone: string;
  email: string;
  address: string;

  currency: string;
  timezone: string;

  // Payment Methods
  enableCash: boolean;
  enableMpesa: boolean;
  enableCredit: boolean;

  // Receipt
  receiptHeader: string;
  receiptFooter: string;
  paperWidth: string;

  showCashier: boolean;
  showCustomer: boolean;
  showLogo: boolean;
  autoPrint: boolean;
  printDuplicate: boolean;

  // Payment Settings
  defaultPaymentMethod: string;
  requireFullPayment: boolean;

  // M-Pesa
  mpesaEnvironment: string;
  mpesaShortcode: string;
  mpesaTillNumber: string;
  mpesaConsumerKey: string;
  mpesaConsumerSecret: string;
  mpesaPasskey: string;
  mpesaCallbackUrl: string;
  mpesaAutoVerify: boolean;

  // Inventory Settings
lowStockAlert: number;
allowNegativeStock: boolean;
autoDeductStock: boolean;
trackInventory: boolean;
stockValuation: string;
requireBarcode: boolean;

// User & Role Settings
sessionTimeout: number;

managerRefund: boolean;
managerPriceOverride: boolean;
managerCancelSale: boolean;

cashierSell: boolean;
cashierPrintReceipt: boolean;
cashierDeleteSale: boolean;
cashierChangePrice: boolean;

// Security Settings
requirePinRefund: boolean;
requirePinVoidSale: boolean;
requirePinDiscount: boolean;
requirePinCashDrawer: boolean;

minimumPasswordLength: number;
autoLogoutMinutes: number;

enableAuditLog: boolean;

// Backup Settings
autoBackup: boolean;
backupFrequency: string;
retainBackups: number;

backupSales: boolean;
backupInventory: boolean;
backupCustomers: boolean;
backupSettings: boolean;
}
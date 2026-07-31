SELECT
  "createdAt",
  "type",
  "quantity",
  "reason"
FROM "InventoryMovement"
WHERE "storeId" = 'cmrj98gz70000mneof8jfrrlv'
  AND "productId" = 'cmrj9109t0000mn0wk959venm'
ORDER BY "createdAt" DESC;
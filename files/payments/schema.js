// Prisma schema for products, sessions, and payments
const paymentSchemaString = `
// Payment schema
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CheckoutSession {
  id        String   @id 
  userId    String
  processed Boolean  @default(false)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CheckoutSessionItems[]
}

model CheckoutSessionItems {
  id        Int      @id @default(autoincrement())
  quantity  Int
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  sessionId String
  session   CheckoutSession @relation(fields: [sessionId], references: [id])
}

model Purchase {
  id        Int      @id @default(autoincrement())
  userId    String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     PurchaseItems[]
}

model PurchaseItems {
  id        Int      @id @default(autoincrement())
  quantity  Int
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  purchaseId Int
  purchase   Purchase @relation(fields: [purchaseId], references: [id])
}
`

export default paymentSchemaString

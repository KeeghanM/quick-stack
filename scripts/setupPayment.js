import { spawn } from "child_process"
import ora from "ora"
import path from "path"
import fs from "fs"

// files to write
import envString from "../files/payments/env.js"
import paymentSchemaString from "../files/payments/schema.js"
import createCheckoutSessionString from "../files/payments/createCheckoutSession.js"
import checkoutSuccessString from "../files/payments/checkoutSuccess.js"

export default function setupPayment(slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Setting up payments...",
      color: "blue",
    }).start()

    // Install stripe
    const spawnProcess = spawn("npm", ["install", "stripe"], {
      shell: true,
      cwd: path.join(process.cwd(), slugName),
    })

    // Once installed, we need to add the required environment variables
    spawnProcess.on("exit", (code) => {
      // Add the required environment variables
      const envPath = path.join(process.cwd(), slugName, ".env")
      fs.appendFileSync(envPath, `\n${envString}\n`)

      // Add the Payment schema to the Prisma schema
      const schemaPath = path.join(
        process.cwd(),
        slugName,
        "prisma/schema.prisma"
      )
      fs.appendFileSync(schemaPath, `\n${paymentSchemaString}\n`)

      // Create the createCheckoutSession file
      const createSessionPath = path.join(
        process.cwd(),
        slugName,
        "src/app/api/payments/createCheckoutSession"
      )
      fs.mkdirSync(createSessionPath, { recursive: true })
      fs.writeFileSync(
        `${createSessionPath}/route.ts`,
        createCheckoutSessionString
      )

      // Create the checkoutSuccess file
      const checkoutSuccessPath = path.join(
        process.cwd(),
        slugName,
        "src/app/api/payments/checkoutSuccess"
      )
      fs.mkdirSync(createSessionPath, { recursive: true })
      fs.writeFileSync(`${checkoutSuccessPath}/route.ts`, checkoutSuccessString)

      spinner.succeed("Payment setup complete!")
      resolve()
    })
  })
}

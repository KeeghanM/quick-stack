import { spawn } from "child_process"
import ora from "ora"
import path from "path"
import fs from "fs"

// files to write
import authString from "../files/auth/auth.js"
import envString from "../files/auth/env.js"
import authSchemaString from "../files/auth/prismaSchema.js"

export default async function setupAuth(slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Setting up authentication...",
      color: "blue",
    }).start()

    // Install nextAuth and Nodemailer which is used for sending emails
    const spawnProcess = spawn(
      "npm",
      ["install", "next-auth", "nodemailer", "@auth/prisma-adapter"],
      {
        shell: true,
        cwd: path.join(process.cwd(), slugName),
      }
    )

    // Once installed, we need to add the required environment variables
    spawnProcess.on("exit", (code) => {
      // Add the required environment variables
      const envPath = path.join(process.cwd(), slugName, ".env")
      fs.appendFileSync(envPath, `${envString}\n`)

      // Create the auth file
      const authPath = path.join(process.cwd(), slugName, "src/app/api")
      fs.mkdirSync(authPath, { recursive: true })
      fs.writeFileSync(`${authPath}/[...nextauth].ts`, authString)

      // Add the Account and Session models to the Prisma schema
      const schemaPath = path.join(
        process.cwd(),
        slugName,
        "prisma/schema.prisma"
      )
      fs.appendFileSync(schemaPath, `\n${authSchemaString}\n`)

      spinner.succeed("Authentication setup complete!")
      resolve()
    })
  })
}

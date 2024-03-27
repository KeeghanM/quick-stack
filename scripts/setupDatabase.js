import { spawn } from "child_process"
import ora from "ora"
import path from "path"
import fs from "fs"

// file imports
import envString from "../files/database/env.js"
import schemaString from "../files/database/schema.js"
import dbString from "../files/database/db.js"

export default function setupDatabase(slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Installing Prisma...",
      color: "blue",
    }).start()

    // Install Prisma
    const installProcess = spawn("npm install", ["prisma", "--save-dev"], {
      shell: true,
      cwd: path.join(process.cwd(), slugName),
    })

    // Once installed, we need to run the prisma setup
    installProcess.on("exit", (code) => {
      spinner.text = "Setting up Prisma..."

      // Init the Prisma schema
      const prismaProcess = spawn("npx", ["prisma", "init"], {
        shell: true,
        cwd: path.join(process.cwd(), slugName),
      })

      prismaProcess.on("exit", (code) => {
        spinner.text = "Setting up the client..."

        // Modify the .env file
        const envPath = path.join(process.cwd(), slugName, ".env")
        fs.writeFileSync(envPath, `${envString}\n`)

        // Overwrite the schema.prisma file
        const schemaPath = path.join(
          process.cwd(),
          slugName,
          "prisma/schema.prisma"
        )
        fs.writeFileSync(schemaPath, schemaString)

        // We need to now install the client packages
        // and setup the client instance
        const clientProcess = spawn(
          "npm install",
          ["@prisma/client", "@libsql/client", "@prisma/adapter-libsql"],
          {
            shell: true,
            cwd: path.join(process.cwd(), slugName),
          }
        )

        clientProcess.on("exit", (code) => {
          // create the db.ts file in the db folder
          const dbPath = path.join(process.cwd(), slugName, "src/db")
          fs.mkdirSync(dbPath, { recursive: true })
          fs.writeFileSync(`${dbPath}/db.ts`, dbString)

          spinner.succeed("Prisma install complete!")
          resolve()
        })
      })
    })
  })
}

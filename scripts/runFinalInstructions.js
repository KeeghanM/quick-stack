import { spawn } from "child_process"
import ora from "ora"
import path from "path"

export default async function setupGit(slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Running final tidy up..",
      color: "blue",
    }).start()

    const prettierProcess = spawn("npx", ["prettier", "--write", "."], {
      shell: true,
      cwd: path.join(process.cwd(), slugName),
    })

    prettierProcess.on("exit", (code) => {
      spinner.succeed("Final tidy up complete!")
      resolve()
    })
  })
}

import { spawn } from "child_process"
import ora from "ora"
import path from "path"

export default async function setupGit(slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Initiating Git Repo...",
      color: "blue",
    }).start()

    const gitProcess = spawn("git init", {
      shell: true,
      cwd: path.join(process.cwd(), slugName),
    })

    gitProcess.on("exit", (code) => {
      const liveProcess = spawn("git checkout -b live", {
        shell: true,
        cwd: path.join(process.cwd(), slugName),
      })
      liveProcess.on("exit", (code) => {
        const addProcess = spawn("git add .", {
          shell: true,
          cwd: path.join(process.cwd(), slugName),
        })
        addProcess.on("exit", (code) => {
          const commitProcess = spawn("git commit -m 'initial commit'", {
            shell: true,
            cwd: path.join(process.cwd(), slugName),
          })
          commitProcess.on("exit", (code) => {
            const devProcess = spawn("git checkout -b dev", {
              shell: true,
              cwd: path.join(process.cwd(), slugName),
            })
            devProcess.on("exit", (code) => {
              spinner.succeed("Git Repo Initialized!")
              resolve()
            })
          })
        })
      })
    })
  })
}

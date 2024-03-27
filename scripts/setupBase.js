import { spawn } from "child_process"
import ora from "ora"

export default function setupBase(name) {
  return new Promise((resolve, reject) => {
    // Create a new NextJS project
    const process = spawn(
      "npx",
      [
        "create-next-app@latest",
        name,
        "--ts",
        "--use-npm",
        "--tailwind",
        "--eslint",
        "--app",
        "--src-dir",
        "--import-alias ~/*",
      ],
      {
        shell: true,
      }
    )

    let spinner = ora({
      text: "Setting up the base of the project...",
      color: "blue",
    }).start()

    process.stdout.on("data", (data) => {
      const output = data.toString()

      // Check the output for specific strings
      if (output.includes("create-next-app")) {
        // install the package if needed
        process.stdin.write("y\n")
      } else if (output.includes("Installing dependencies")) {
        // Change the spinner text once we start installing dependencies
        spinner.text = "Installing NextJS & Dependencies..."
      }
    })

    process.on("exit", (code) => {
      spinner.succeed("Base setup complete!")
      resolve()
    })
  })
}

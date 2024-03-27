import { spawn } from "child_process"
import ora from "ora"
import path from "path"
import fs from "fs"

// files to write
import quickStackThemes from "../files/theme/quickStack.js"
import blueThemes from "../files/theme/blue.js"
import greenThemes from "../files/theme/green.js"
import coffeeThemes from "../files/theme/coffee.js"
import bubbleGumThemes from "../files/theme/bubbleGum.js"

export default async function setupTheme(theme, slugName) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Setting up the theme...",
      color: "blue",
    }).start()

    // Install nextAuth and Nodemailer which is used for sending emails
    const spawnProcess = spawn("npm install", ["-D", "daisyui@latest"], {
      shell: true,
      cwd: path.join(process.cwd(), slugName),
    })

    // Once installed, setup the actual theme
    spawnProcess.on("exit", (code) => {
      // First, add the plugin to tailwind.config
      const tailwindPath = path.join(
        process.cwd(),
        slugName,
        "tailwind.config.ts"
      )
      let tailwindConfig = fs.readFileSync(tailwindPath, "utf-8")
      tailwindConfig = tailwindConfig.replace(
        "plugins: [",
        `plugins: [\n    require('daisyui'),`
      )

      // Then add the theme to the tailwind.config
      tailwindConfig = tailwindConfig.replace(
        "plugins",
        `daisyui: {
                themes: ${getThemeString(theme)}
            },
            plugins`
      )
      fs.writeFileSync(tailwindPath, tailwindConfig)

      // Now we need to install theme-change
      const themeChangeProcess = spawn("npm install", ["theme-change"], {
        shell: true,
        cwd: path.join(process.cwd(), slugName),
      })

      themeChangeProcess.on("exit", (code) => {
        // Add theme-change to the layout.tsx file
        const layoutPath = path.join(
          process.cwd(),
          slugName,
          "src/app/layout.tsx"
        )
        let layoutFile = fs.readFileSync(layoutPath, "utf-8")
        // Add the imports
        layoutFile = layoutFile.replace(
          'import "./globals.css";',
          `import { useEffect } from "react";
            import "./globals.css";
            import { themeChange } from "theme-change";`
        )
        // Add the useEffect
        layoutFile = layoutFile.replace(
          "return",
          `useEffect(() => {
                themeChange(false);
            }, []);
            return`
        )
        // Add the data-theme
        layoutFile = layoutFile.replace(
          `<html lang="en">`,
          `<html lang="en" data-theme="light">`
        )
        fs.writeFileSync(layoutPath, layoutFile)

        // TODO: Create a toggle component

        spinner.succeed("Theme setup complete")
        resolve()
      })
    })
  })
}

function getThemeString(theme) {
  switch (theme) {
    case "Quick Stack":
      return quickStackThemes
    case "Blue":
      return blueThemes
    case "Green":
      return greenThemes
    case "Coffee":
      return coffeeThemes
    case "Bubble Gum":
      return bubbleGumThemes
  }
}

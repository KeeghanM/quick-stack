import ora from "ora"
import path from "path"
import fs from "fs"

// files to write
import homeString from "../files/pages/home.js"

export default async function setupPages(slugName, name) {
  return new Promise((resolve, reject) => {
    let spinner = ora({
      text: "Building the landing page...",
      color: "blue",
    }).start()

    // Replace the {{NAME}} placeholder with the actual name
    let updatedHomeString = homeString.replace(/{{NAME}}/g, name)

    // Write the page.tsx file
    const pagePath = path.join(
      process.cwd(),
      slugName,
      "src",
      "app",
      "page.tsx"
    )
    fs.writeFileSync(pagePath, updatedHomeString)

    spinner.succeed("Landing page created!")
    resolve()
  })
}

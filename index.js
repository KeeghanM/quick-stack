#!/usr/bin/env node

import inquirer from "inquirer"
import slugify from "./util/slugify.js"
import chalk from "chalk"

// Import the setup functions
import setupBase from "./scripts/setupBase.js"
import setupDatabase from "./scripts/setupDatabase.js"
import setupAuth from "./scripts/setupAuth.js"
import setupTheme from "./scripts/setupTheme.js"
import setupPages from "./scripts/setupPages.js"
import setupGit from "./scripts/setupGit.js"
import setupPayment from "./scripts/setupPayment.js"
import runTidyup from "./scripts/runTidyup.js"

const questions = [
  {
    type: "input",
    name: "name",
    message:
      "Project name? This will be used for your Landing Page, titles, and more.",
    default: "Quick Stack",
  },
  {
    type: "list",
    name: "theme",
    message:
      "Which theme do you want to use? (All themes include a light/dark mode toggle by default)",
    choices: ["Quick Stack", "Blue", "Green", "Bubble Gum", "Coffee"], // TODO: Add "Custom" option
    default: "Quick Stack",
  },
  {
    type: "list",
    name: "currency",
    message: "Which currency do you want to use?",
    choices: ["USD", "EUR", "GBP", "NZD"],
    default: "USD",
  },
]

async function main() {
  const answers = await inquirer.prompt(questions)
  const name = answers.name
  const slugName = slugify(name)
  const theme = answers.theme
  const currency = answers.currency

  await setupBase(slugName)
  await setupDatabase(slugName)
  await setupAuth(slugName)
  await setupTheme(theme, slugName, name)
  await setupPages(slugName, name)
  await setupPayment(slugName, currency)
  await runTidyup(slugName)
  await setupGit(slugName)

  // Show a success message
  console.log(`\n🚀 ${chalk.green(name)} is ready!`)
  console.log(`\n⚠️ Before you get started,`)
  console.log(`Search the codebase for ${chalk.redBright(`"CHANGE-ME"`)}`)
  console.log(`They'll all need changing before you can run the project.`)
}

main()

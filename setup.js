import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";

const markerFile = path.resolve(".setup-complete");

async function main() {
  if (fs.existsSync(markerFile)) {
    console.log("Setup ist bereits abgeschlossen.");
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "packageName",
      message: "Bitte App-Namen eingeben:",
    },
  ]);

  const sanitizedId = sanitizeInput(answers.packageName);

  // Update index.html with sanitized input
  await updateName(sanitizedId);

  // Mark setup as complete
  fs.writeFileSync(markerFile, "Setup abgeschlossen");
  console.log(`Setup abgeschlossen. App-Name: "${sanitizedId}"`);
}

function sanitizeInput(input) {
  return input
    .replace(/[\s-]/g, "_") // Replace spaces and hyphens with underscores
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove invalid characters
    .toLowerCase();
}

async function updateName(newId) {
  const currentYear = new Date().getFullYear();
  const baseUrl = `https://dynamic.faz.net/red/${currentYear}/${newId}`;

  // Update package.json
  const packageJsonPath = "./package.json";
  const packageJson = await fs.readJSON(packageJsonPath);
  packageJson.name = newId;
  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  console.log(`- package.json aktualisiert`);

  // Update index.html
  const indexPath = "./index.html";
  const indexHtml = await fs.readFile(indexPath, "utf-8");
  const indexUpdatedHtml = indexHtml.replace(/<div\s+[^>]*data-version[^>]*/i, `<div data-version="" id="${newId}"`);
  await fs.writeFile(indexPath, indexUpdatedHtml);
  console.log(`- index.html aktualisiert`);

  // Update main.js
  const mainPath = "./src/main.js";
  const mainHtml = await fs.readFile(mainPath, "utf-8");
  // Replace the selector ID (e.g., #app)
  const updatedSelectorHtml = mainHtml.replace(/#\w+/g, `#${newId}`);
  // Replace any variable starting with "app_" dynamically
  const updatedAppHtml = updatedSelectorHtml.replace(/app_\w+/g, `app_${newId}`);
  await fs.writeFile(mainPath, updatedAppHtml);
  console.log(`- main.js aktualisiert`);

  // Update styles.scss
 const stylesPath = "./src/styles/style.scss";
  const stylesContent = await fs.readFile(stylesPath, "utf-8");
  const updatedStylesContent = stylesContent.replace(/#\w+\s*{/g, `#${newId} {`);
  await fs.writeFile(stylesPath, updatedStylesContent, "utf-8");
  console.log(`- styles.scss updated with new ID: ${newId}`);

  // Update .env.stage
  const envPath = "./.env.stage";
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = await fs.readFile(envPath, "utf-8");
    envContent = envContent.replace(/VITE_APP_BASE_URL=.*/i, `VITE_APP_BASE_URL='${baseUrl}/stage'`);
  } else {
    envContent = `VITE_APP_BASE_URL='${baseUrl}/stage'\n`;
  }
  await fs.writeFile(envPath, envContent);
  console.log(`- .env.production aktualisiert`);

  // Update .env.production
  const envProdPath = "./.env.production";
  let envProdContent = "";
  if (fs.existsSync(envProdPath)) {
    envProdContent = await fs.readFile(envProdPath, "utf-8");
    envProdContent = envProdContent.replace(/VITE_APP_BASE_URL=.*/i, `VITE_APP_BASE_URL='${baseUrl}/release'`);
  } else {
    envProdContent = `VITE_APP_BASE_URL='${baseUrl}/release'\n`;
  }
  await fs.writeFile(envProdPath, envProdContent);
  console.log(`- .env.production aktualisiert`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

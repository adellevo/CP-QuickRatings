const fs = require("fs");

function copyAssets() {
  const publicFiles = fs.readdirSync("public");
  for (let file of publicFiles) {
    fs.copyFileSync(`public/${file}`, `dist/${file}`);
  }
}

const enableWatcher = process.argv.includes("-dev") ? { onRebuild: copyAssets } : false;

require("esbuild")
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outdir: "dist",
    format: "esm",
    watch: enableWatcher,
  })
  .catch(() => process.exit(1));

// Copy assets on first build
copyAssets();

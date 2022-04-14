const fs = require("fs");

const enableWatcher = process.argv.includes("-dev");

require("esbuild")
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outdir: "dist",
    format: "esm",
    watch: enableWatcher,
  })
  .catch(() => process.exit(1));

const publicFiles = fs.readdirSync("public");
for (let file of publicFiles) {
  fs.copyFileSync(`public/${file}`, `dist/${file}`);
}

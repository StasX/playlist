const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

// Generate the static entry page using the filenames produced by either build.
class StaticSitePlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("StaticSitePlugin", (compilation) => {
            const templatePath = path.join(__dirname, "../src/index.html");
            compilation.fileDependencies.add(templatePath);
            compilation.hooks.processAssets.tap({
                name: "StaticSitePlugin",
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
            }, () => {
                const files = compilation.entrypoints.get("main").getFiles();
                const tags = files.map(file => file.endsWith(".css")
                    ? `<link rel="stylesheet" href="/${file}">`
                    : file.endsWith(".js") ? `<script defer src="/${file}"></script>` : ""
                ).join("\n");
                const favicon = fs.readFileSync(path.join(__dirname, "../public/favicon.ico"));
                const faviconVersion = createHash("sha256").update(favicon).digest("hex").slice(0, 8);
                const html = fs.readFileSync(templatePath, "utf8")
                    .replace("<!-- assets -->", tags)
                    .replace('href="/favicon.ico"', `href="/favicon.ico?v=${faviconVersion}"`);
                compilation.emitAsset("index.html", new compiler.webpack.sources.RawSource(html));
                for (const name of ["favicon.ico", "robots.txt"]) {
                    const sourcePath = path.join(__dirname, "../public", name);
                    compilation.fileDependencies.add(sourcePath);
                    compilation.emitAsset(name, new compiler.webpack.sources.RawSource(fs.readFileSync(sourcePath)));
                }
            });
        });
    }
}

module.exports = StaticSitePlugin;

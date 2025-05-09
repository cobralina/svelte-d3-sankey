import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import prefixSelector from "postcss-prefix-selector";

const env = process.env;
const packageInfo = require("./package.json");
const sanitizedPackageName = packageInfo.name;


// Generate HTML content based on placeholders
function generateHtmlContent(isIframe, sanitizedPackageName, public_folder, packageInfoVersion, mode) {
  let checkDomain = ``;
  if (mode != "test" && mode != "development") {
    const domain = "https://" + new URL(public_folder).hostname;
    checkDomain = `
      if (event.origin !== "${domain}") {
        return;
      }
    `;
  }
  if (isIframe) {
    return {
      polopoly: `
          <iframe id="iframe${sanitizedPackageName}" src="${public_folder}/iframe.html" frameborder="0" style="width: 100%"></iframe>
          <script>
            function handle${sanitizedPackageName}(event) {
              ${checkDomain}
              if (event.data.iframeHeight${sanitizedPackageName}) {
                document.getElementById("iframe${sanitizedPackageName}").style.height = event.data.iframeHeight${sanitizedPackageName} + 10 + "px";
              }
            }
            window.addEventListener("message", handle${sanitizedPackageName}, false);
          </script>
      `,
      iframe: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,indexifembedded" />
  <title>${sanitizedPackageName}</title>
</head>
<body style="padding: 0;margin: 0">
<!-- START ${sanitizedPackageName} (iframe version) -->
  <link rel="stylesheet" href="${public_folder}/css/styles.css" />
  <div data-version="${packageInfoVersion}" id="${sanitizedPackageName}"></div>
  <script src="${public_folder}/js/app.umd.js"></script>
  <script> 
  window.config = { direction:"target", party:"BSW" }
  window.meta = { headline:"Bundestagswahl 2025", kicker:"Wählerwanderung", subline:"Sehen Sie hier, wohin die Wähler abgewandert sind", past:"2021", current:"2025", source:"Bundewahlleiter" }
  window.data = {"nodes":[
  {"name":"Union", "color":"#2d557a"},
  {"name":"SPD", "color": "#ce3b3b"},
  {"name":"Grüne", "color":"#669c54"},
  {"name":"AfD", "color": "#93bcec"},
  {"name":"Linke", "color":"#8b50d3"},
  {"name":"FDP", "color":"#ddae3c"},
  {"name":"BSW", "color":"#ac4687"},
  {"name":"Nichtwähler", "color": "#cccccc"},
  {"name":"Union", "color":"#2d557a"},
  {"name":"SPD", "color": "#ce3b3b"},
  {"name":"Grüne", "color":"#669c54"},
  {"name":"AfD", "color": "#93bcec"},
  {"name":"Linke", "color":"#8b50d3"},
  {"name":"FDP", "color":"#ddae3c"},
  {"name":"BSW", "color":"#ac4687"},
  {"name":"Nichtwähler", "color": "#cccccc"}
  ],
  "links":[
  {"source":1,"target":12,"value":20000},
  {"source":0,"target":9,"value":10556},
  {"source":1,"target":10,"value":20766},
  {"source":5,"target":8,"value":2077},
  {"source":1,"target":15,"value":60333},
  {"source":2,"target":11,"value":24999},
  {"source":2,"target":14,"value":11999},
  {"source":4,"target":8,"value":6455},
  {"source":3,"target":8,"value":7877},
  {"source":5,"target":9,"value":26000},
  {"source":6,"target":12,"value":2000},
  {"source":4,"target":13,"value":22100},
  {"source":6,"target":10,"value":12998},
  {"source":4,"target":14,"value":40000},
  {"source":7,"target":14,"value":12000}
  ]}
  </script>
  <script>
    function load_${sanitizedPackageName}() {
      if (typeof app_${sanitizedPackageName} !== "undefined") {
        app_${sanitizedPackageName}.mountApp("#${sanitizedPackageName}");
      } else {
        const appElement = document.getElementById("${sanitizedPackageName}");
        if (!appElement) {
          console.error('Element with id "app" not found.');
          return;
        }
        const script = document.createElement("script");
        script.src = "${public_folder}/js/app.umd.js";
        script.onload = () => app_${sanitizedPackageName}.mountApp("#${sanitizedPackageName}");
        appElement.parentNode.insertBefore(script, appElement.nextSibling);
      }
    }
    load_${sanitizedPackageName}();

    var sendPostMessage = () => {
      setInterval(() => {
        var app${sanitizedPackageName} = document.getElementById("${sanitizedPackageName}");
        var iframeHeight = app${sanitizedPackageName}.scrollHeight;
        var urlParams = new URLSearchParams(window.location.search);
        let wwID = urlParams.get('id');
        if (iframeHeight) {
          parent.postMessage({ ['iframeHeight' + wwID]: iframeHeight }, "*");
        }
      }, 1000);
    };
    window.onload = () => sendPostMessage();
  </script>
<!-- END -->
</body>
</html>
      `,
    };
  }

  return {
    polopoly: `
    <!-- START ${sanitizedPackageName} -->
  <link rel="stylesheet" href="${public_folder}/css/styles.css" />
  <div data-version="${packageInfoVersion}" id="${sanitizedPackageName}"></div>
  <script src="${public_folder}/js/app.umd.js"></script>
  <script>
    function load_${sanitizedPackageName}() {
      if (typeof app_${sanitizedPackageName} !== "undefined") {
        app_${sanitizedPackageName}.mountApp("#${sanitizedPackageName}");
      } else {
        const appElement = document.getElementById("${sanitizedPackageName}");
        if (!appElement) {
          console.error('Element with id "app" not found.');
          return;
        }
        const script = document.createElement("script");
        script.src = "${public_folder}/js/app.umd.js";
        script.onload = () => app_${sanitizedPackageName}.mountApp("#${sanitizedPackageName}");
        appElement.parentNode.insertBefore(script, appElement.nextSibling);
      }
    }
    load_${sanitizedPackageName}();
  </script>
<!-- END -->
`,
  };
}

export default ({ mode }) => {
  const isProduction = mode === "production";
  const env = loadEnv(mode, process.cwd(), "");

  const distribution_folder = `${env.VITE_APP_DISTRIBUTION_FOLDER}`;
  const public_folder = `${env.VITE_APP_BASE_URL}`;
  const isIframe = env.VITE_APP_IFRAME === "true";

  let hasSourcemap = false;
  if (env.VITE_APP_PRODUCTION_SOURCE_MAP === "true") {
    hasSourcemap = true;
  }

  // Fetch the appropriate HTML content
  const htmlContent = generateHtmlContent(isIframe, sanitizedPackageName, public_folder, packageInfo.version, mode);

  console.log("------------------------------------------------------------------------");
  console.log(" " + packageInfo.name + " - " + packageInfo.version);
  console.log("------------------------------------------------------------------------");

  return defineConfig({
    base: public_folder,
    build: {
      sourcemap: hasSourcemap,
      lib: {
        entry: "./src/main.js",
        name: "app_" + sanitizedPackageName,
        fileName: "app",
        formats: ["es", "umd"],
      },
      rollupOptions: {
        output: {
          dir: distribution_folder,
          entryFileNames: `js/app.[format].js`,
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name.split(".").pop();
            if (ext === "css") {
              return "css/styles.css";
            }
            return "assets/[name].[ext]";
          },
        },
      },
    },
    define: {
      "process.env": {},
      __APP_NAME__: JSON.stringify(sanitizedPackageName),
      __APP_VERSION__: JSON.stringify(packageInfo.version),
    },
    /* css: {
      postcss: {
        plugins: [
          prefixSelector({
            prefix: `#${sanitizedPackageName}`,
            exclude: [`#${sanitizedPackageName}`, `#${sanitizedPackageName} `], // Match exact selector and any trailing spaces
          }),
        ],
      },
    }, */
    plugins: [
      svelte(),
      {
        name: "generate-index-html",
        apply: "build",
        generateBundle(_, bundle) {
          // Emit `polopoly.html`
          this.emitFile({
            type: "asset",
            fileName: "polopoly.html",
            source: htmlContent.polopoly.trim(),
          });
          this.emitFile({
            type: "asset",
            fileName: "index.html",
            source: `
<!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizedPackageName}</title>
  </head>
  <body>
    ${htmlContent.polopoly.trim()}
  </body>
</html>`,
          });

          //Emit `iframe.html` only if `isframe` is true
          if (isIframe) {
            this.emitFile({
              type: "asset",
              fileName: "iframe.html",
              source: htmlContent.iframe.trim(),
            });
          }
        },
      },
      // {
      //   name: "generate-index-html",
      //   apply: "build",
      //   generateBundle(_, bundle) {
      //     const htmlContent =
      //     this.emitFile({
      //       type: "asset",
      //       fileName: "polopoly.html",
      //       source: htmlContent.trim(),
      //     });
      //   },
      // },
    ],
    server: {
      open: true,
      host: "localhost",
      port: 3000,
    },
  });
};

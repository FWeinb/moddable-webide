# moddable-webide | [![Netlify Status](https://api.netlify.com/api/v1/badges/47caa840-a649-4096-9371-e6b8d82b0ce0/deploy-status)](https://app.netlify.com/sites/distracted-hoover-d4cde4/deploys)

> WebIDE to get started with [Moddable-SDK](https://github.com/Moddable-OpenSource/moddable)

## Development

### Running

```
npm install
npm run start
```

Will start a webpack dev server.

### Debugging

You can use the [overmind](https://overmindjs.org)-devtools using `npx overmind-devtools`

### Building moddable sdk as wasm artefact

> Currently only working on macOS

Build the [`wasmtools`](https://github.com/phoddie/runmod/blob/master/wasmtools.md).
Afterwards you can find the build in `$MODDABLE/build/bin/wasm/release` copy the `tool.{js,wasm}` into the `xs` folder of this project.

# moddable-webide

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

To update the `xscl` build in `xs/xscl.{js,wasm}` you need to checkout the [moddable sdk](https://github.com/Moddable-OpenSource/moddable) and have [emscripten](https://github.com/emscripten-core/emscripten) installed and setup.

To compile the `wasm` targed you first need to have a version of `xsl` for your host arcitecture. To build it go to `moddable/xs/makefiles/mac` and run `make GOAL=release -f xsl.mk` after that you can build the `wasm` release.

Got to `moddable/xs/makefiles/wasm` and run `make GOAL=release -f xscl.mk` building this can take a little longer.

Afterwards you can find the build in `moddable/build/wasm/release/` copy the `xscl.{js,wasm}` into the `xs` folder of this project.

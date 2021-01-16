import resolve from "@rollup/plugin-node-resolve";

import autoExternal from "rollup-plugin-auto-external";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

import pkg from "./package.json";

const minifyExtension = (pathToFile) => pathToFile.replace(/\.js$/, ".min.js");

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "auto",
    },
    {
      file: minifyExtension(pkg.main),
      format: "cjs",
      exports: "auto",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  plugins: [
    terser({
      include: [/^.+\.min\.js$/],
    }),
    autoExternal(),
    resolve(),
    commonjs(),
    typescript({
      typescript: require("typescript"),
    }),
  ],
};

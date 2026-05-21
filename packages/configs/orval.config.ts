import { defineConfig, InputTransformerFn } from "orval";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..", "..");
const apiSpecPath = path.resolve(root, "services", "api-server", "openapi", "openapi.yaml");
const apiClientSrc = path.resolve(root, "packages", "api-client", "src");
const validationsSrc = path.resolve(root, "packages", "validations", "src");

const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  "api-client": {
    input: {
      target: apiSpecPath,
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  validations: {
    input: {
      target: apiSpecPath,
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: validationsSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ["boolean", "number", "string"],
            param: ["boolean", "number", "string"],
            body: ["bigint", "date"],
            response: ["bigint", "date"]
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});

import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.CODEGEN_SCHEMA ?? "../nxpay-backend/schema.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/__generated__/**/*"],
  ignoreNoDocuments: true,
  generates: {
    "./src/__generated__/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: {
          BigInteger: "bigint",
          DateTimeISO: "string",
          JSON: "unknown",
          JSONObject: "Record<string, unknown>",
        },
      },
    },
  },
};

export default config;

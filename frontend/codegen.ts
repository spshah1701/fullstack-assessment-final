import { CodegenConfig } from '@graphql-codegen/cli'
 
const config: CodegenConfig = {
    overwrite: true,
    schema: "http://localhost:8000/graphql",
    documents: ["src/**/*.{ts,tsx}"],
    generates: {
      "./src/__generated__/": {
        preset: 'client',
        plugins: [],
        config: {
          useTypeImports: true,
          withHooks: true,
          reactApolloVersion: 4,
          noNamespaces: true,
          importOperationTypesFrom: "Operations",
        },
      }
    },
    ignoreNoDocuments: true,
  };
 
export default config
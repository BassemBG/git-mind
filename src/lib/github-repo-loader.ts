import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5,
  })
  const docs = await loader.load();
  return docs;
}

console.log(await loadGithubRepo('https://github.com/PathyTK/pathy-web', process.env.GITHUB_TOKEN));


// Return type is array of Document:
// Document {
//     pageContent: "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\nimport { AppModule } from './app/app.module';\n\n\nplatformBrowserDynamic().bootstrapModule(AppModule)\n  .catch(err => console.error(err));\n",
//     metadata: {
//       source: "src/main.ts",
//       repository: "https://github.com/BassemBG/ngrx-counter",
//       branch: "main",
//     },
//     id: undefined,
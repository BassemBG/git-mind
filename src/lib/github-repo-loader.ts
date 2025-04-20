import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents';
import { generate } from 'node_modules/@langchain/core/dist/utils/fast-json-patch';
import { generateEmbedding, summariseCode } from './gemini';
import { db } from '@/server/db';
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

console.log(await loadGithubRepo('https://github.com/BassemBG/java-crud-interface', process.env.GITHUB_TOKEN));


// Return type is array of Document:
// Document {
//     pageContent: "import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\nimport { AppModule } from './app/app.module';\n\n\nplatformBrowserDynamic().bootstrapModule(AppModule)\n  .catch(err => console.error(err));\n",
//     metadata: {
//       source: "src/main.ts",
//       repository: "https://github.com/BassemBG/ngrx-counter",
//       branch: "main",
//     },
//     id: undefined,


export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`Processing file ${index + 1} of ${allEmbeddings.length}`);
    if(!embedding) return;

    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        projectId: projectId,
      }
    })

    await db.$executeRaw`
    UPDATE "sourceCodeEmbeddings"
    SET "summaryEmbedding" = ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbedding.id} AND "projectId" = ${projectId}
    `;
    
  }
}

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async (doc) => {
    const summary = await summariseCode(doc);
    const embedding = await generateEmbedding(summary);
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    }
  }));

}
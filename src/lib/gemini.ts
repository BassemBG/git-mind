import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { Doc } from "prettier";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});


export const aiSummariseCommit = async (diff: string) => {
  console.log("\nAI generating Summary...\n");

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI summarization timed out")), 30000) // 30s timeout
  );

  try {
    const response = (await Promise.race([
      model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):

\`\`\`
diff --git a/lib/index.js b/lib/index.js 
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`

This means that \`lib/index.js\` was modified in this commit. Note that this is only an example. 
Then there to a specifier of the lines that were modified.
A line starting with \`+\` means It was added.
A line that starts with \`-\` means that line was deleted.
A line that starts with nether \`+\` nor \`-\` da code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts}, [packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` Initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`,
        `Please summarise the following diff file: \n\n${diff}`,
      ]),
      timeout,
    ])) as { response: { text: () => string } }; // Explicitly cast response type

    console.log(`\nResponse from AI: ${response.response.text()}\n`);
    return response.response.text();
  } catch (error) {
    console.error("AI summarization failed:", error);
    return ""; // Return empty summary on failure
  }
};


export async function summariseCode(doc: Document){
  console.log("getting summary for ", doc.metadata.source);

  //TODO: add quota management and error handling for the API calls
  try {
    const code = doc.pageContent.slice(0, 10000); // Limit to 10000 characters so that i don't get thrown out of the API or exceed context
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding unior software engineers onto projects.`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.`,
      `Here is the code:
      ---
      ${code}
      ---
      Give a summary no more than 100 words of the code above.
      `,
    ]);
  
    return response.response.text();
  
  } catch(error){
    return ''
  }
}


export async function generateEmbedding(summary: string) {
  const result = await embeddingModel.embedContent(summary);
  const embedding = result.embedding;


  return embedding.values;
}

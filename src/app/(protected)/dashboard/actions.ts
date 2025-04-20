'use server'

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createStreamableValue } from 'ai/rsc';
import { generateEmbedding } from '@/lib/gemini';
import { db } from '@/server/db';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue();

    const queryEmbedding = await generateEmbedding(question);
    const queryVector = `[${queryEmbedding.join(',')}]`;

    const result = await db.$queryRaw`
        SELECT "fileName", "summary", "sourceCode",
        1 - ("summaryEmbedding" <=> ${queryVector}::vector) AS "similarity"
        FROM "sourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${queryVector}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY "similarity" DESC
        LIMIT 10;
    ` as { fileName: string; summary: string; sourceCode: string}[];

    let context = '';
    for (const doc of result) {
        context += `Source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nSummary of file: ${doc.summary}\n\n`;
    }

    (async () => {
        const { textStream } = await streamText({
            model: google('gemini-2.0-flash'),
            prompt: `
                You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.
                AT assistant is a brand new, powerful, humon-like artificial Intelligence.
                The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
                AI is a well-behaved and well-mannered individual.
                AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user
                AI has the sun of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
                If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.
                START CONTEXT BLOCK
                ${context}
                END OF CONTEXT BLOCK

                START QUESTION
                ${question}
                END OF QUESTION
                AI assistant will take into account any CONTEXT BLOCK that is provided in a converstation.
                If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question.".
                AI assistant will not apologize for previous responses, but instead will indicate new information is gained.
                AI assistant will not invent anything that is not drawn directly from the context.
                Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make suere there is no ambiguity in your answer.
            `,
        });

        for await (const delta of textStream){
            stream.update(delta);
        }

        stream.done();
    })()

    return {
        output: stream.value,
        filesReferences: result,
    };

}
import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  // URL Format: https://github.com/[OWNER]/[REPO]
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid Github Url");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner: owner,
    repo: repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 7).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? ("" as string),
    commitAuthorName: commit.commit?.author.name ?? ("" as string),
    commitAuthorAvatar: commit.author?.avatar_url ?? ("" as string),
    commitDate: commit.commit?.author?.date ?? ("" as string),
  }));
};

export const pullCommits = async (projectId: string) => {
  console.log("Fetching github url...");

  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  console.log("pulling commit hashes from github...");

  const commitHashes = await getCommitHashes(githubUrl);
  console.log("Filtering unprocessed commits...");

  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  console.log("checking if there aren't unprocessed commits...");

  if (unprocessedCommits.length == 0) {
    return [];
  }
  console.log(`There are ${unprocessedCommits.length} unprocessed commits.`);
  console.log("Summarising commits with ai...");

  const summariesResponses = await Promise.allSettled(
    unprocessedCommits.map((commit, index) => {
      console.log(`Processing Commit ${index + 1}...`);

      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );
  const summaries = summariesResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }

    return "";
  });

  console.log("Saving commits in DB...");

  //save new unprocessed commits in db
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`Saving Commit ${index + 1}...`);

      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary,
      };
    }),
  });

  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  //get diff which will be passed to genAI
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  const aiSummary = await aiSummariseCommit(data);
  console.log("Summary: ", aiSummary);

  return aiSummary || "";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no Github Url");
  }

  return {
    project,
    githubUrl: project?.githubUrl,
  };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId: projectId },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}

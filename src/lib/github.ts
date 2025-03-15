import { db } from "@/server/db";
import { Octokit } from "octokit";

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

const githubUrl =
  "https://github.com/BassemBG/Django-Gaming-Tournaments-Platform";

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const { data } = await octokit.rest.repos.listCommits({
    owner: "BassemBG",
    repo: "Django-Gaming-Tournaments-Platform",
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? ("" as string),
    commitAuthorName: commit.commit?.author.name ?? ("" as string),
    commitAuthorAvatar: commit.author?.avatar_url ?? ("" as string),
    commitDate: commit.commit?.author?.date ?? ("" as string),
  }));
};

console.log(await getCommitHashes(githubUrl));

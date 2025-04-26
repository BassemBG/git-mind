import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pullCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-repo-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          userToProjects: {
            create: {
              userId: ctx.user.userId!, //we are in protectedRoute so user wil always be !null
            },
          },
        },
      });
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pullCommits(project.id);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        userToProjects: { some: { userId: { equals: ctx.user.userId! } } },
        deletedAt: null,
      },
    });

    return projects;
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pullCommits(input.projectId).then().catch(console.error)
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
    }),

  saveAnswer: protectedProcedure.input(
    z.object({
      projectId: z.string(),
      question: z.string(),
      answer: z.string(),
      filesReferences: z.any()
    }),
  ).mutation(async ({ ctx, input }) => {
    return await ctx.db.question.create({
      data: { 
        userId: ctx.user.userId!,
        projectId: input.projectId,
        question: input.question,
        answer: input.answer,
        filesReferences: input.filesReferences
      },
    })
  }),

  getQuestions: protectedProcedure.input(
    z.object({
      projectId: z.string(),

    })).query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: { projectId: input.projectId },
        include: { user: true},
        orderBy: { createdAt: 'desc' }
      });
    })

});

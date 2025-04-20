import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import { ExternalLink } from 'lucide-react';
import React from 'react'
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Commit = {
    commitMessage: string;
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
    summary: string;
  };

const CommitLog = () => {

    const {selectedProjectId, selectedProject}=useProject();
    const {data: commits} = api.project.getCommits.useQuery({projectId: selectedProjectId});
    
  return (
    <>
        <ul className='space-y-6'>
            {commits?.map((commit, commitIdx)=> {
                return (
                    <li key={commit.id} className='relative flex gap-x-4'>
                        <div className={cn(
                            commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                            'absolute left-0 top-0 flex w-6 justify-center'
                        )}>
                            <div className="w-px translate-x-1 bg-gray-200"></div>
                        </div>
                        <>
                            <img src={commit.commitAuthorAvatar} alt="commit author avatar"  className='size-8 mt-4 z-10 flex-none rounded-full bg-gray-50 '/>
                            <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                                <div className="flex justify-between gap-x-4">
                                    <Link target='_blank' href={`${selectedProject?.githubUrl}/commit/${commit.commitHash}`} className='py-0.5 text-xs leading-5 text-gray-500 hover:underline'>
                                        <span className="font-extrabold text-gray-900">
                                            {commit.commitAuthorName}
                                        </span> {" "}
                                        <span className='inline-flex items-center'>
                                            commited
                                            <ExternalLink className='ml-1 size-3.5'/>
                                        </span>
                                    </Link>
                                </div>
                                <span className='font-semibold'>
                                    {commit.commitMessage}
                                </span>
                                <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                                    {commit.summary}
                                </pre>
                                
                            </div>
                        </>
                    </li>
                )
            })
            }    
                
        </ul>
    </>
    
    
  )
}

export default CommitLog
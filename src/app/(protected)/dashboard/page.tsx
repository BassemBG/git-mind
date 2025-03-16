'use client'

import { Button } from '@/components/ui/button';
import useProject from '@/hooks/use-project';
import { UserButton, useUser } from '@clerk/nextjs'
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import CommitLog from './commit-log';

function DashboardPage() {
    const { user } = useUser();
    const { selectedProject } = useProject();
  return (
    <div>
        <div className="flex items-center justify-center md:justify-between flex-wrap gap-y-4">
          {/* Github Link */}
            <div className='flex items-center bg-primary w-fit text-white rounded-md px-4 py-2'>
              <Github className='size-5' />
              <div className="ml-2">
                <p className='text-sm font-medium'> 
                  This project is linked to {' '}
                  <Link href={selectedProject?.githubUrl ?? ""} className='inline-flex items-center text-white/80 hover:underline'>
                    {selectedProject?.githubUrl ?? ""}
                    <ExternalLink className='size-4 ml-1'/>
                  </Link>
                </p>
                
              </div>
              
            </div>
            {/* Invite Member/Archive */}
            <div className='flex items-center justify-center gap-4'>
                <UserButton/>
                <Button variant={'outline'} className='font-bold'>
                  invite a team member!
                </Button>
                <Button variant={'outline'} className='font-bold'>
                  Archive
                </Button>
            </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            AskQuestionsCard
            MeetingCard
          </div>
        </div>

        <div className="mt-8">
          <CommitLog/>
        </div>
    </div>
    
  )
}

export default DashboardPage
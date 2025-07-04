'use client'

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
    filesReferences: { fileName: string; summary: string; sourceCode: string }[];
}

const CodeReferences = ({ filesReferences }: Props) => {
    const [tab, setTab] = React.useState(filesReferences[0]?.fileName);
    if (filesReferences.length === 0) return null;
    
    return (
        <div className='max-w-[70vw]'>
            <Tabs value={tab} onValueChange={setTab}>
                <div className="overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md">
                    {filesReferences.map((file) => {
                        return (
                            <button onClick={() => {setTab(file.fileName)}} key={file.fileName} className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground',
                                {
                                    'bg-primary text-primary-foreground': tab === file.fileName,
                                }
                            )
    
                            }>
                                {file.fileName}
                            </button>
                        )
       
                    })}
                </div>
                {filesReferences.map((file) => {
                    return (
                        <TabsContent key={file.fileName} value={file.fileName} className='max-h-[40vh] overflow-scroll max-w-7xl rounded-md'>
                            <SyntaxHighlighter language='typescript' style={lucario}>
                                {file.sourceCode}
                            </SyntaxHighlighter>
                        </TabsContent>                    
                    )

                })}
            </Tabs>
        </div>
    )
}

export default CodeReferences
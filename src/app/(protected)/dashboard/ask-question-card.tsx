import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import Image from 'next/image';
import React from 'react'
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MDEditor from '@uiw/react-md-editor';
import { Loader2 } from 'lucide-react';
import CodeReferences from './code-references';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const AskQuestionCard = () => {
    const { selectedProject } = useProject();
    const [ openDialog, setOpenDialog ] = React.useState(false);
    const [ question, setQuestion ] = React.useState('');
    const [ loading, setLoading ] = React.useState(false);
    const [ filesReferences, setFilesReferences ] = React.useState<{ fileName: string; summary: string; sourceCode: string }[]>([]);
    const [ answer, setAnswer ] = React.useState('');
    const saveAnswer = api.project.saveAnswer.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('');
        setFilesReferences([]);
        e.preventDefault();
        if (!selectedProject?.id) return;
        setLoading(true)

        const { output, filesReferences } = await askQuestion(question, selectedProject.id);
        setOpenDialog(true);
        setFilesReferences(filesReferences);

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta);
            }
        }

        setLoading(false);

    }
    return (
        <>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='sm:max-w-[80vw] d-flex flex-col items-center justify-center'>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                <Image src='/logo.webp' alt='GitMind logo' width={40} height={40} />
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                                saveAnswer.mutate(
                                    { 
                                        projectId: selectedProject!.id, 
                                        question, 
                                        answer, 
                                        filesReferences 
                                    }, {
                                        onSuccess: () => {
                                            toast.success('Answer saved successfully!');
                                        },
                                        onError: () => {
                                            toast.error('Failed to save answer!');
                                        }

                                    }
                                );
                            }}>
                                Save Answer!
                            </Button>
                        </div>
                    </DialogHeader>

                    <MDEditor.Markdown
                        source={answer}
                        className='max-w-[70vw] !h-full max-h-[30vh] overflow-scroll'
                    />
                    <CodeReferences filesReferences={filesReferences} />
                    <Button type='button' onClick={() => setOpenDialog(false)}>
                        Close
                    </Button>
{/*                     
                    {filesReferences.map((file) => {
                        return <span> {file.fileName} </span>
                    })} */}
                </DialogContent>
            </Dialog>

            <Card className='relative col-span-5'>
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='eg. Which file should I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)}/>
                        <div className="h-4"></div>
                        <Button type='submit' disabled={loading}>
                            {loading && (
                                <Loader2 className="animate-spin" />
                            )}
                            Ask GitMind!
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )

}

export default AskQuestionCard
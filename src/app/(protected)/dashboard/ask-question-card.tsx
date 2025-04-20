import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import Image from 'next/image';
import React from 'react'

const AskQuestionCard = () => {
    const { project } = useProject();
    const [ openDialog, setOpenDialog ] = React.useState(false);
    const [ question, setQuestion ] = React.useState('');

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpenDialog(true);
    }
    return (
        <>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <Image src='/logo.webp' alt='GitMind logo' width={40} height={40} />
                        </DialogTitle>
                    </DialogHeader>
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
                        <Button type='submit'>Ask GitMind!</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )


  return (
    <div>ask-question-card</div>
  )
}

export default AskQuestionCard
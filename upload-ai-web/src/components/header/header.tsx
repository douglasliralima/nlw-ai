import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Header() {
    return (
        <div className='px-6 py-4 flex justify-between items-center border-b'>
            <div>
                <h1 className='text-xl font-bold'>upload.ai</h1>
            </div>
            <div className='flex gap-6 items-center'>

                <span className='text-sm text-muted-foreground'>Desenvolvido com 💜 no NLW da rocketseat</span>

                <Separator className='h-8' orientation='vertical' />

                <Button variant={"secondary"}>
                    <Github className='h-4 w-4 mr-1' />
                    Github
                </Button>

            </div>
        </div>
    )
}
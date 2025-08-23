
import { cn } from "@/lib/utils.ts";

interface LoadingProps {
    className?: string;
    dotClassName?: string;
}

function Loading(props: LoadingProps) {
    return (
        <div className={cn('flex gap-2 justify-center items-center dark:invert')}>
            <span className='sr-only'>Loading...</span>
            <div className={cn('h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.3s]', props.className)}></div>
            <div className={cn('h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.15s]', props.className)}></div>
            <div className={cn('h-4 w-4 bg-black rounded-full animate-bounce', props.className)}></div>
        </div>
    )
}

export default Loading;
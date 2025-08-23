import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import Editor from "@/components/editor.tsx";
import useSession from "@/hooks/session/use-session.ts";
import {Tooltip, TooltipProvider, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip.tsx";
import Loading from "@/components/ui/loading.tsx";
import {useSearchParams} from "react-router-dom";

function EditorPage() {
    const [searchParams] = useSearchParams();
    const documentId = searchParams.get("d");

    if (!documentId) {
        return <div className="w-screen h-screen bg-white grid place-items-center">Invalid document id</div>
    }

    const { session, title, loading, connected, connecting, reconnect, changeTitle } = useSession(documentId);

    return (
        <div className="w-full h-full bg-white flex flex-col max-w-default mx-auto rounded-2xl border overflow-hidden">
            { loading ?
                <div className="w-full h-full grid place-items-center">
                    <Loading />
                </div>
                :
                <>
                    <div className="w-full flex justify-between items-center">
                        <input
                            className="px-8 py-6 border-b text-2xl font-bold text-gray-700 focus:outline-none"
                            value={title}
                            onChange={(e) => changeTitle(e.target.value)}
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipContent>
                                    {connecting ? "Connecting..." : connected ? "Connected" : "Disconnected, click to retry"}
                                </TooltipContent>
                                <TooltipTrigger>
                                    <button
                                        disabled={connecting || connected}
                                        onClick={reconnect}
                                        className={
                                            (connecting ? "bg-yellow-600 animate-pulse" :
                                            connected ? "bg-green-400" : "bg-red-500") +
                                            " w-3 h-3 rounded-full mr-8 cursor-pointer"
                                        }
                                    ></button>
                                </TooltipTrigger>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <ScrollArea className="h-full">
                        <Editor session={session}/>
                    </ScrollArea>
                </>
            }
        </div>
    )
}

export default EditorPage;
import DocumentList from "@/components/document-list";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  
import { FaPlus } from "react-icons/fa";

import { ScrollArea } from "@/components/ui/scroll-area";
import useGetDocuments from "@/hooks/document/use-get-documents.ts";
import Loading from "@/components/ui/loading.tsx";
import useCreateDocument from "@/hooks/document/use-create-document.ts";



function DashboardPage() {
    const { loading, documents } = useGetDocuments();
    const { create, loading: createLoading } = useCreateDocument();

    const onCreateClick = () => {
        if (createLoading) return;
        create("Untitled Document");
    }

    return (
        <div className="w-full h-full bg-white flex flex-col max-w-default mx-auto rounded-2xl border">
            <h1 className="px-8 py-6 border-b text-2xl font-bold text-gray-700">
                Documents
            </h1>
            {
                loading && (
                    <div className="w-full h-full grid place-items-center">
                        <Loading />
                    </div>
                )
            }
            {
                !loading && (
                    <ScrollArea className="h-full">
                        <div className="w-full h-[calc(100%-5rem)] flex flex-col px-2 md:px-8 py-8">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipContent className="bg-gray-600">
                                        Create a new document
                                    </TooltipContent>
                                    <TooltipTrigger className="w-min">
                                        <div
                                            onClick={onCreateClick}
                                            className="
                                                w-min cursor-pointer hover:bg-gray-100 active:scale-95 transition-transform
                                                rounded-xl border-[1.5px] grid place-items-center
                                            "
                                        >
                                            <div className="p-16 grid place-items-center">
                                                {createLoading ? <div className="w-10 h-10 my-auto mx-auto flex flex-col justify-center">
                                                    <Loading />
                                                </div> : <FaPlus className="w-10 h-10 text-gray-500" />}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="mt-4 px-2 h-[calc(100%-10.5rem-3px)] flex-col">
                                <h2 className="text-lg text-gray-600 border-b py-4">
                                    Recent Documents
                                </h2>
                                <DocumentList className="h-[calc(100%-3.75rem)]" documents={documents} />
                            </div>
                        </div>
                    </ScrollArea>
                )
            }
        </div>
    )
}

export default DashboardPage;
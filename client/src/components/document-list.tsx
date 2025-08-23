import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { DocumentInfo } from "@/lib/models/document.ts";
import { BsThreeDotsVertical } from "react-icons/bs";

import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en'
import {useNavigate} from "react-router-dom";
import userGetUser from "@/hooks/user/use-get-user.ts";
import useDeleteDocument from "@/hooks/document/use-delete-document.ts";

TimeAgo.addLocale(en);

interface DocumentListProps {
    documents: DocumentInfo[];
    className?: string;
}

export default function DocumentList(props: DocumentListProps) {
    return (
        <div className="my-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {props.documents.map((doc) => (
                <DocumentItem key={doc.id} {...doc} />
            ))}
        </div>
    )
}

function DocumentItem(props: DocumentInfo) {
    const navigate = useNavigate();
    const { user } = userGetUser(props.ownerId);
    const { deleteDocument, loading: deleteLoading } = useDeleteDocument(props.id)
    const timeAgo = new TimeAgo("en-US");
    const onClick = () => {
        navigate({ pathname: "/editor", search: `?d=${props.id}` });
    }

    return (
        <Card 
            key={props.id}
            onClick={onClick}
            className={
                "shadow-none hover:bg-gray-50 cursor-pointer relative"
                + (deleteLoading ? " opacity-50 pointer-events-none cursor-not-allowed" : "")
            }
            >
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>{props.title}</CardTitle>
                    <CardDescription>{"@" + (user ? user.username : "unknown")}</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger onClick={stopPropagation} className="absolute right-3 top-2" asChild>
                        <span className="p-2 -mt-6 rounded-full hover:bg-gray-100">
                            <BsThreeDotsVertical />
                        </span>
                    </PopoverTrigger>
                    <PopoverContent onClick={stopPropagation} className="w-[8rem] p-0">
                        <DeleteDocument id={props.id} deleteFunc={deleteDocument}>
                            <button className="w-full p-3 px-4 text-left hover:bg-gray-100">
                                Delete
                            </button>
                        </DeleteDocument>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardFooter>
                <p className="text-sm text-gray-500">Created {timeAgo.format(props.createdAt)}</p>
            </CardFooter>
        </Card>
    )
}

function DeleteDocument(props: { id: string, deleteFunc: () => void, children?: React.ReactNode }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {props.children}
            </AlertDialogTrigger>
            <AlertDialogContent onClick={stopPropagation}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the document.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter onClick={stopPropagation}>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={props.deleteFunc}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
}
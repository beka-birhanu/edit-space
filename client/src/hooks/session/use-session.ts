import {useContext, useEffect, useRef, useState} from "react";
import Session from "@/lib/adapters/session.ts";
import {useToast} from "@/hooks/util/use-toast.ts";
import useFetch from "@/hooks/util/use-fetch.ts";
import { DocumentResponse } from "@/lib/models/document.ts";
import Config from "@/lib/config.ts";
import {useNavigate} from "react-router-dom";
import {DocumentsContext} from "@/components/documents-provider.tsx";


function useSession(documentId: string) {
    const url = `${Config.formattedBaseUrl()}/documents/${documentId}`;
    const sessionRef = useRef<Session>();
    const changeTitleTimeout = useRef<NodeJS.Timeout>();
    const navigate = useNavigate();
    const { updateTitle: ut } = useContext(DocumentsContext);

    const [connected, setConnected] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(true);
    const [title, setTitle] = useState<string>("");

    const { query, loading, isError, success, error } = useFetch<DocumentResponse>(url, false, DocumentResponse.fromJson);
    const { toast } = useToast()

    const updateTitle = (newTitle: string) => {
        ut(documentId, newTitle);
        setTitle(newTitle);
    };

    const onConnectionChange = (connected: boolean) => {
        setConnected(connected);
    }

    const onConnectingChange = (connecting: boolean) => {
        setConnecting(connecting);
    }

    const onDisconnect = () => {
        toast({
            title: "Connection with server Lost",
            description: "Attempts of reconnection failed... check your internet connection",
            variant: "destructive"
        });
        setConnected(false);
    }

    const changeTitle = (newTitle: string) => {
        updateTitle(newTitle);
        if (changeTitleTimeout.current) {
            clearTimeout(changeTitleTimeout.current);
        }
        const timeout = setTimeout(() => {
            sessionRef.current?.processTitleChange(newTitle);
        }, 1000);
        changeTitleTimeout.current = timeout;
    }

    useEffect(() => {
        if (sessionRef.current == undefined) {
            sessionRef.current = new Session(documentId);
            onConnectingChange(true);
            onConnectionChange(false);
            sessionRef.current.onConnectionChange(onConnectionChange);
            sessionRef.current.onConnectingChange(onConnectingChange);
            sessionRef.current.onDisconnected(onDisconnect);
            query().then((document) => {
                if (!document) return;
                updateTitle(document.document.title);
                const delta = sessionRef.current!.addCharacters(document.characters);
                sessionRef.current!.initialDelta = delta;
            });
        }
        sessionRef.current.onIncomingTitle((title) => {
            updateTitle(title);
        })
        sessionRef.current.connect();

        return () => {
            sessionRef.current!.close();
            sessionRef.current = undefined;
        }
    }, [])

    useEffect(() => {
        if (isError) {
            if ((error as any)?.status_code === 401) {
                navigate("/auth")
            }
            if ((error as any)?.status_code === 404) {
                navigate("/404")
            }
        }
    }, [isError]);

    const session = sessionRef.current!

    const reconnect = () => session.reconnect()
    return { session, title, loading, success, isError, connected, connecting, reconnect, changeTitle };
}

export default useSession;
import Session from "@/lib/adapters/session.ts";
import { useEffect, useRef } from "react";
import Quill, { Delta, Range, EmitterSource } from "quill/core";
import QuillCursors from "quill-cursors";

function useEditor(session: Session | undefined) {
    const quillRef = useRef<Quill>(null);

    const onTextChange = (delta: Delta, _: Delta, source: EmitterSource) => {
        if (source !== 'user' || session === undefined) { return; }
        session.processDelta(delta)
    }

    const onCursorChange = (range: Range, source: EmitterSource, session: Session) => {
        if (source === 'api') { return; }
        session.processCursorChange(range);
    }

    const onSelectionChange = (range: Range, _: Range, source: EmitterSource) => {
        onCursorChange(range, source, session!);
    }

    useEffect(() => {
        if (session === undefined) {
            return;
        }

        const cursors = quillRef.current!.getModule('cursors') as QuillCursors;

        session.onIncomingDelta((delta) => {
            quillRef.current!.updateContents(delta, 'api')
        })

        session.onIncomingCursor((cursor) => {
            cursors.createCursor(cursor.clientId, cursor.username, cursor.color)
            cursors.moveCursor(cursor.clientId, { index: cursor.start, length: cursor.length })
        })

    }, [session])

    return { quillRef, onTextChange, onSelectionChange }
}

export default useEditor;
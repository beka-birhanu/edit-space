import {forwardRef, MutableRefObject, useEffect, useLayoutEffect, useRef} from 'react';
import Quill, { Delta, EmitterSource, Range, Op } from 'quill/core';
import QuillCursors from "quill-cursors";
import 'quill/dist/quill.snow.css';

Quill.register("modules/cursors", QuillCursors);

interface QuillEditorProps {
    readOnly?: boolean;
    defaultValue?: [Delta | Op[], EmitterSource?];
    onTextChange?: (delta: Delta, oldContent: Delta, source: EmitterSource) => void;
    onSelectionChange?: (range: Range, oldRange: Range, source: EmitterSource) => void;
    className?: string;
}

// Editor is an uncontrolled React component
const QuillEditor = forwardRef<Quill, QuillEditorProps>(
    ({ readOnly, defaultValue, onTextChange, onSelectionChange, className }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const defaultValueRef = useRef(defaultValue);
        const onTextChangeRef = useRef(onTextChange);
        const onSelectionChangeRef = useRef(onSelectionChange);

        useLayoutEffect(() => {
            onTextChangeRef.current = onTextChange;
            onSelectionChangeRef.current = onSelectionChange;
        });

        useEffect(() => {
            (ref as MutableRefObject<Quill | null>).current?.enable(!readOnly);
        }, [ref, readOnly]);

        useEffect(() => {
            const container = containerRef.current;
            const editorContainer = container?.appendChild(
                container.ownerDocument.createElement('div'),
            );
            editorContainer!.style.padding = "1rem"
            const quill = new Quill(editorContainer!, {
                modules: {
                    cursors: true
                }
            });

            (ref as MutableRefObject<Quill | null>).current = quill;

            if (defaultValueRef.current) {
                quill.setContents(...defaultValueRef.current);
            }

             quill.on(Quill.events.TEXT_CHANGE, (...args) => {
                onTextChangeRef.current?.(...args);
            });

            quill.on(Quill.events.EDITOR_CHANGE, (eventName, ...args) => {
                if (eventName === Quill.events.SELECTION_CHANGE) {
                    onSelectionChangeRef.current?.(...args as [Range, Range, EmitterSource]);
                }
            });

            return () => {
                (ref as MutableRefObject<Quill | null>).current = null;
                container!.innerHTML = '';
            };
        }, [ref]);

        return <div className={className} ref={containerRef}></div>;
    },
);``

QuillEditor.displayName = 'Editor';

export default QuillEditor;
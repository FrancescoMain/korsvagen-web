import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";

const EditorContainer = styled.div`
  .ql-editor {
    min-height: 100px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
  }

  .ql-toolbar {
    border-top: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    border-radius: 8px 8px 0 0;
    background: #f8f9fa;
  }

  .ql-container {
    border-bottom: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    border-radius: 0 0 8px 8px;
    background: white;
  }

  .ql-editor:focus {
    outline: none;
  }
`;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  toolbar?: "minimal" | "basic" | "full";
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Inizia a scrivere...",
  height = 150,
  toolbar = "basic",
  readOnly = false,
}) => {
  const modules = useMemo(() => {
    const toolbarOptions = {
      minimal: [["bold", "italic"], ["link"], ["clean"]],
      basic: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        ["link", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
      full: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        ["link", "blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["clean"],
      ],
    };

    return {
      toolbar: toolbarOptions[toolbar],
      clipboard: {
        matchVisual: false,
      },
    };
  }, [toolbar]);

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
    "script",
    "code-block",
  ];

  return (
    <EditorContainer>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{ height: `${height}px` }}
      />
    </EditorContainer>
  );
};

export default RichTextEditor;

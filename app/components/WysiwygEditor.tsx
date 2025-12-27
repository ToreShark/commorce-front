"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Загрузка редактора...</p>,
});

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = "Введите текст...",
}: WysiwygEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link"],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "link",
    "align",
  ];

  return (
    <div className="wysiwyg-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
      <style jsx global>{`
        .wysiwyg-editor .ql-container {
          min-height: 300px;
          font-size: 16px;
        }
        .wysiwyg-editor .ql-editor {
          min-height: 300px;
        }
      `}</style>
    </div>
  );
}

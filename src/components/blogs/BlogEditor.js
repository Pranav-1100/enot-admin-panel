import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function BlogEditor({ value, onChange, placeholder = 'Write your blog content here...' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  if (!mounted) {
    return (
      <div className="h-64 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="blog-editor">
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
        .blog-editor .quill {
          display: flex;
          flex-direction: column;
        }
        .blog-editor .ql-container {
          min-height: 300px;
          font-size: 16px;
          flex: 1;
        }
        .blog-editor .ql-editor {
          min-height: 300px;
        }
        .blog-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
// import { upload } from '@vercel/blob/client';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export interface EditorProps {
  value: string;
  onChange?: (content: string) => void;
  disabled?: boolean;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const quillRef = React.useRef<any | null>(null);

  const imageHandler = React.useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.className = 'sr-only';
    document.body.append(input);
    input.click();

    input.addEventListener('change', async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        // const blob = await upload(file.name, file, {
        //   access: 'public',
        //   handleUploadUrl: '/api/uploads',
        // });

        const editor = quillRef.current?.getEditor();
        const range = editor?.getSelection();
        
        if (range) {
          // editor.insertEmbed(range.index, 'image', blob.url);
          editor.setSelection(range.index + 1, 1);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        document.body.removeChild(input);
      }
    });
  }, []);


  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  const handleChange = (content: string) => {
    if (!disabled && onChange) {
      onChange(content);
    }
  };

  return (
    <ReactQuill
    //@ts-ignore
      forwardedRef={quillRef}
      value={value}
      onChange={handleChange}
      modules={quillModules}
      theme="snow"
      readOnly={disabled}
      preserveWhitespace
    />
  );
};

export default Editor;

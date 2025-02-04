import React, { useEffect, useState, useRef } from 'react';

const EditorContent = ({ editorRef, onInput }) => {
  const contentRef = useRef(null);
  const [pageBreaks, setPageBreaks] = useState([]);
  
  // A4 dimensions in pixels (assuming 96 DPI)
  const PAGE_HEIGHT_CM = 29.7;
  const CM_TO_PX = 37.795275591; // 1cm = 37.7953px at 96 DPI
  const PAGE_HEIGHT = Math.round(PAGE_HEIGHT_CM * CM_TO_PX); // ~1122px
  const MARGINS = 96; // 1-inch margins
  const CONTENT_HEIGHT = PAGE_HEIGHT - (MARGINS * 2);

  const updatePageBreaks = () => {
    if (editorRef.current) {
      const content = editorRef.current;
      const contentHeight = content.scrollHeight;
      const numberOfPages = Math.max(1, Math.ceil(contentHeight / CONTENT_HEIGHT));
      const breaks = [];

      // Calculate positions for page breaks
      for (let i = 1; i < numberOfPages; i++) {
        breaks.push(i * CONTENT_HEIGHT);
      }

      setPageBreaks(breaks);
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(updatePageBreaks);
    if (editorRef.current) {
      observer.observe(editorRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleInput = (e) => {
    onInput(e);
    updatePageBreaks();
  };

  return (
    <div className="flex-1 bg-gray-100 py-8">
      <div className="mx-auto relative" style={{ maxWidth: '850px' }}>
        {/* Editor container */}
        <div 
          className="bg-white shadow-lg mx-auto relative"
          style={{
            width: '793px', // A4 width
            minHeight: PAGE_HEIGHT,
            padding: `${MARGINS}px`,
          }}
        >
          {/* Editable content */}
          <div
            ref={editorRef}
            contentEditable
            className="outline-none min-h-full"
            onInput={handleInput}
            style={{
              fontFamily: 'Calibri, Arial, sans-serif',
              // fontSize: '11pt',
              lineHeight: '1.5',
              color: '#000000',
              wordWrap: 'break-word',
            }}
          />

          {/* Page break lines and numbers */}
          {pageBreaks.map((breakPosition, index) => (
            <div 
              key={index}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ 
                top: `${breakPosition + MARGINS}px`,
              }}
            >
              {/* Page break line */}
              <div 
                className="absolute w-full border-t border-gray-300"
                style={{
                  borderStyle: 'dashed',
                }}
              />
              
              {/* Page numbers */}
              <div 
                className="absolute w-full text-center -mt-4"
                style={{
                  color: '#666',
                  fontSize: '10pt',
                }}
              >
                <span className="bg-white px-2">Page {index + 1}</span>
              </div>
              
            </div>
          ))}
        </div>
      </div>

      <style>{`
        [contenteditable] {
          white-space: pre-wrap;
          cursor: text;
        }
        
        [contenteditable] table {
          border-collapse: collapse;
          margin: 12px 0;
          width: 100%;
        }
        
        [contenteditable] td {
          border: 1px solid #000000;
          padding: 5px 10px;
          min-width: 90px;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 8px 0;
        }
        
        [contenteditable] a {
          color: #0563C1;
          text-decoration: underline;
        }

        @media print {
          .page-break {
            break-after: page;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default EditorContent;
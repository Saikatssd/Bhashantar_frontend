import React, { useState, useRef, useEffect } from 'react';

// Import your subcomponents
import Toolbar from './Toolbar/Toolbar';
import EditorContent from './EditorContent';
import StatusBar from './StatusBar';
import FindReplaceDialog from './Dialogs/FindReplaceDialog';
import TableDialog from './Dialogs/TableDialog';
import ImageDialog from './Dialogs/ImageDialog';

const EditorContainer = ({ initialContent = '', onChange }) => {
  const editorRef = useRef(null);

  // States
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [imageConfig, setImageConfig] = useState({
    url: '',
    alt: '',
    width: '300',
    height: '200',
  });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState([]);

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7',
    '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff', '#980000',
    '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
    '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af'
  ];

  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  const fontSizes = [
    { label: '8', value: '1' },
    { label: '10', value: '2' },
    { label: '12', value: '3' },
    { label: '14', value: '4' },
    { label: '18', value: '5' },
    { label: '24', value: '6' },
    { label: '36', value: '7' }
  ];

  // On mount, set initial content
  // useEffect(() => {
  //   if (editorRef.current) {
  //     editorRef.current.innerHTML = initialContent;
  //     updateCounts();
  //   }
  // }, [initialContent]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;
      updateCounts();
    }
  }, [initialContent]);

  // Track content changes and notify parent
  useEffect(() => {
    const handleInput = () => {
      if (editorRef.current && onChange) {
        const newContent = editorRef.current.innerHTML;
        onChange(newContent); // Notify parent of content change
        updateCounts();
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', handleInput);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('input', handleInput);
      }
    };
  }, [onChange]);


  // Save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCursorPosition = (savedRange) => {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  };

  // ---- Core Editor Commands ----
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value ?? undefined);
    updateCounts();
  };

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      setCharCount(text.length);
    }
  };

  // ---- Insert Image ----
  const insertImage = () => {
    const imgHtml = `<img src="${imageConfig.url}" alt="${imageConfig.alt}" 
        style="width: ${imageConfig.width}px; height: ${imageConfig.height}px;" />`;
    execCommand('insertHTML', imgHtml);
    setShowImageDialog(false);
    setImageConfig({ url: '', alt: '', width: '300', height: '200' });
  };

  // ---- Insert Table ----


  const insertTable = (tableHTML) => {
    if (editorRef.current) {
      // Ensure the editor is focused
      editorRef.current.focus();

      // Get the selection and ensure it's within the editor
      const selection = window.getSelection();
      if (!selection.rangeCount || !editorRef.current.contains(selection.anchorNode)) {
        console.warn('Selection is outside the editor');
        return;
      }

      const range = selection.getRangeAt(0);

      // Create a wrapper div for the table
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.overflowX = 'auto';
      wrapper.innerHTML = tableHTML;

      // Insert the wrapped table at the current cursor position
      range.deleteContents();
      range.insertNode(wrapper);

      // Add a line break after the table for better spacing
      const br = document.createElement('br');
      if (wrapper.nextSibling) {
        wrapper.parentNode.insertBefore(br, wrapper.nextSibling);
      } else {
        wrapper.parentNode.appendChild(br);
      }

      // Place the cursor in the first cell of the table
      const firstCell = wrapper.querySelector('td, th');
      if (firstCell) {
        const cellRange = document.createRange();
        cellRange.selectNodeContents(firstCell);
        cellRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(cellRange);
        firstCell.focus();
      }

      // Close the dialog
      setShowTableDialog(false);
    }
  };




  // ---- Find and Replace Logic ----
  const handleFindReplace = (action = 'find') => {
    if (!editorRef.current) return;

    const editorContent = editorRef.current.innerHTML;
    const searchText = caseSensitive ? findText : findText.toLowerCase();

    // Clear highlights
    const cleanContent = editorContent.replace(
      /<span class="highlight">(.*?)<\/span>/gi,
      '$1'
    );

    editorRef.current.innerHTML = cleanContent;

    if (findText.trim() === '') {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const searchRegex = new RegExp(findText, `g${caseSensitive ? '' : 'i'}`);
    const newMatches = [];

    // Highlight matches
    const highlightedContent = cleanContent.replace(searchRegex, (matchText, offset) => {
      newMatches.push({ matchText, start: offset });
      return `<span class="highlight">${matchText}</span>`;
    });

    editorRef.current.innerHTML = highlightedContent;
    setMatches(newMatches);

    if (action === 'replace') {
      if (currentMatchIndex >= 0 && currentMatchIndex < newMatches.length) {
        const replaceRegex = new RegExp(
          `(<span class="highlight">)${findText}(</span>)`,
          `g${caseSensitive ? '' : 'i'}`
        );
        const replacedContent = editorRef.current.innerHTML.replace(
          replaceRegex,
          `$1${replaceText}$2`
        );
        editorRef.current.innerHTML = replacedContent;
        handleFindReplace('find'); // Re-highlight
      }
    } else if (action === 'replaceAll') {
      const replaceRegex = new RegExp(findText, `g${caseSensitive ? '' : 'i'}`);
      const replacedContent = cleanContent.replace(replaceRegex, replaceText);
      editorRef.current.innerHTML = replacedContent;
      setMatches([]);
    }
  };

  const navigateMatches = (direction) => {
    if (matches.length === 0) return;
    let newIndex = currentMatchIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) newIndex = matches.length - 1;
    if (newIndex >= matches.length) newIndex = 0;

    setCurrentMatchIndex(newIndex);

    const match = matches[newIndex];
    if (match) {
      const editor = editorRef.current;
      const range = document.createRange();
      const selection = window.getSelection();

      const matchElement = editor.querySelectorAll('.highlight')[newIndex];
      range.selectNodeContents(matchElement);
      selection.removeAllRanges();
      selection.addRange(range);
      matchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* 1. Toolbar */}
      <Toolbar
        execCommand={execCommand}
        setShowColorPicker={setShowColorPicker}
        showColorPicker={showColorPicker}
        colors={colors}
        fonts={fonts}
        fontSizes={fontSizes}
        insertImage={() => setShowImageDialog(true)}
        insertTable={() => setShowTableDialog(true)}
        setShowFindReplace={setShowFindReplace}
      />

      {/* 2. Editor Content */}
      <EditorContent
        editorRef={editorRef}
        onInput={updateCounts}
      />

      {/* 3. Status Bar */}
      {/* <StatusBar wordCount={wordCount} charCount={charCount} /> */}

      {/* 4. Find & Replace Dialog */}
      {showFindReplace && (
        <FindReplaceDialog
          findText={findText}
          setFindText={setFindText}
          replaceText={replaceText}
          setReplaceText={setReplaceText}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
          handleFindReplace={handleFindReplace}
          navigateMatches={navigateMatches}
          matches={matches}
          currentMatchIndex={currentMatchIndex}
          onClose={() => setShowFindReplace(false)}
        />
      )}

      {/* 5. Table Dialog */}
      {/* {showTableDialog && (
        <TableDialog
          tableRows={tableRows}
          setTableRows={setTableRows}
          tableCols={tableCols}
          setTableCols={setTableCols}
          insertTable={insertTable}
          onClose={() => setShowTableDialog(false)}
        />
      )} */}

      {showTableDialog && (
        <TableDialog
          insertTable={insertTable}
          onClose={() => setShowTableDialog(false)}
        />
      )}

      {/* 6. Image Dialog */}
      {showImageDialog && (
        <ImageDialog
          imageConfig={imageConfig}
          setImageConfig={setImageConfig}
          insertImage={insertImage}
          onClose={() => setShowImageDialog(false)}
        />
      )}
    </div>
  );
};

export default EditorContainer;

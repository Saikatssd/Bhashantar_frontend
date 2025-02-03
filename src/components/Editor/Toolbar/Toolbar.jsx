import React from 'react';
import {
  Save, Undo, Redo, Bold, Italic, Underline, Strikethrough, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Indent,
  Outdent, Link2, Image, Table, Search, Type, Highlighter
} from 'lucide-react';

import ListControls from './ListControls';

const Toolbar = ({
  execCommand,
  setShowColorPicker,
  showColorPicker,
  colors,
  fonts,
  fontSizes,
  insertLink,
  insertImage,
  insertTable,
  setShowFindReplace,
}) => {

  const handleColorClick = (color, type) => {
    execCommand(type === 'text' ? 'foreColor' : 'hiliteColor', color);
    setShowColorPicker(null);
  };

  return (
    <div className="bg-white top-0 p-3 shadow-lg fixed z-50 border-b border-gray-200 flex flex-wrap gap-2">
      {/* Example: Save, Undo, Redo */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => execCommand('save')} className="p-1.5 hover:bg-gray-100 rounded">
          <Save size={18} />
        </button>
        <button onClick={() => execCommand('undo')} className="p-1.5 hover:bg-gray-100 rounded">
          <Undo size={18} />
        </button>
        <button onClick={() => execCommand('redo')} className="p-1.5 hover:bg-gray-100 rounded">
          <Redo size={18} />
        </button>
      </div>

      {/* Fonts and Font Sizes */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <select
          onChange={(e) => execCommand('fontName', e.target.value)}
          className="p-1.5 border rounded"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="p-1.5 border rounded"
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>{size.label}</option>
          ))}
        </select>
      </div>

      {/* Bold, Italic, Underline, Strikethrough */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-100 rounded">
          <Bold size={18} />
        </button>
        <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-100 rounded">
          <Italic size={18} />
        </button>
        <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-100 rounded">
          <Underline size={18} />
        </button>
        <button onClick={() => execCommand('strikeThrough')} className="p-1.5 hover:bg-gray-100 rounded">
          <Strikethrough size={18} />
        </button>
      </div>

      {/* Color pickers */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <div className="relative">
          <button
            onClick={() => setShowColorPicker((prev) => (prev === 'text' ? null : 'text'))}
            className="p-1.5 hover:bg-gray-100 rounded-full"
          >
            <Type size={18} />
          </button>
          {showColorPicker === 'text' && (
            <div className="absolute top-full w-36 left-0 bg-white shadow-lg rounded p-2 grid grid-cols-5 gap-1 z-50">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color, 'text')}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color, border: '1px solid #ddd' }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker((prev) => (prev === 'highlight' ? null : 'highlight'))}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <Highlighter size={18} />
          </button>
          {showColorPicker === 'highlight' && (
            <div className="absolute top-full w-36 left-0 bg-white shadow-lg rounded p-2 grid grid-cols-5 gap-1 z-50">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color, 'highlight')}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color, border: '1px solid #ddd' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-gray-100 rounded">
          <AlignLeft size={18} />
        </button>
        <button onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-gray-100 rounded">
          <AlignCenter size={18} />
        </button>
        <button onClick={() => execCommand('justifyRight')} className="p-1.5 hover:bg-gray-100 rounded">
          <AlignRight size={18} />
        </button>
        <button onClick={() => execCommand('justifyFull')} className="p-1.5 hover:bg-gray-100 rounded">
          <AlignJustify size={18} />
        </button>
      </div>

      {/* Lists & Indent */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {/* <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-100 rounded">
          <List size={18} />
        </button>
        <button onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-gray-100 rounded">
          <ListOrdered size={18} />
        </button> */}

        <ListControls execCommand={execCommand} />
        {/* <button onClick={() => execCommand('indent')} className="p-1.5 hover:bg-gray-100 rounded">
       
        </button>
        <button onClick={() => execCommand('outdent')} className="p-1.5 hover:bg-gray-100 rounded">
        </button> */}
        <button onClick={() => execCommand('indent')} className="p-1.5 hover:bg-gray-100 rounded">
          <Indent size={18} />
        </button>
        <button onClick={() => execCommand('outdent')} className="p-1.5 hover:bg-gray-100 rounded">
          <Outdent size={18} />
        </button>
      </div>

      {/* Link, Image, Table */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        {/* <button onClick={insertLink} className="p-1.5 hover:bg-gray-100 rounded">
          <Link2 size={18} />
        </button> */}
        <button onClick={insertImage} className="p-1.5 hover:bg-gray-100 rounded">
          <Image size={18} />
        </button>
        <button onClick={insertTable} className="p-1.5 hover:bg-gray-100 rounded">
          <Table size={18} />
        </button>
      </div>

      {/* Find & Replace */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowFindReplace(true)}
          className="p-1.5 hover:bg-gray-100 rounded"
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

import React, { useState } from 'react';
import { X } from 'lucide-react';

const TableDialog = ({ insertTable, onClose }) => {
  const [hoveredCells, setHoveredCells] = useState({ rows: 0, cols: 0 });
  const maxGrid = { rows: 8, cols: 10 };

  const handleMouseEnter = (row, col) => {
    setHoveredCells({ rows: row + 1, cols: col + 1 });
  };

  const handleInsertTable = () => {
    if (hoveredCells.rows > 0 && hoveredCells.cols > 0) {
      const table = createTableElement(hoveredCells.rows, hoveredCells.cols);
      insertTable(table);
      onClose();
    }
  };

  const createTableElement = (rows, cols) => {
    return `
      <table style="width:100%; border-collapse:collapse; margin:1em 0;">
        <tbody>
          ${Array(rows).fill().map(() => `
            <tr>
              ${Array(cols).fill().map(() => `
                <td style="border:1px solid #ccc; padding:8px; min-width:50px; height:20px;"></td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table><br>
    `;
  };

  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < maxGrid.rows; i++) {
      const row = [];
      for (let j = 0; j < maxGrid.cols; j++) {
        const isHighlighted = i < hoveredCells.rows && j < hoveredCells.cols;
        row.push(
          <div
            key={`${i}-${j}`}
            className={`w-6 h-6 border border-gray-300 transition-colors ${
              isHighlighted ? 'bg-blue-500' : 'bg-white'
            }`}
            onMouseEnter={() => handleMouseEnter(i, j)}
          />
        );
      }
      grid.push(
        <div key={i} className="flex">
          {row}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Insert Table</h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div 
          className="inline-block border border-gray-200 p-1 cursor-pointer"
          onClick={handleInsertTable}
          onMouseLeave={() => setHoveredCells({ rows: 0, cols: 0 })}
        >
          {renderGrid()}
        </div>
        
        <div className="text-sm text-gray-600">
          {hoveredCells.rows > 0 && hoveredCells.cols > 0 ? (
            <span>
              {hoveredCells.rows} × {hoveredCells.cols} Table
            </span>
          ) : (
            <span>Hover to select table dimensions</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDialog;
// src/components/Editor/Toolbar/ListControls.jsx

import React, { useState } from 'react';
import { List, ListOrdered } from 'lucide-react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip
} from '@mui/material';

const listStyles = [
  { label: 'Disc', value: 'disc', icon: '•' },
  { label: 'Circle', value: 'circle', icon: '○' },
  { label: 'Square', value: 'square', icon: '▪' },
  { label: 'None', value: 'none', icon: ' ' }
];

const numberStyles = [
  { label: 'Decimal', value: 'decimal', icon: '1.' },
  { label: 'Lower Alpha', value: 'lower-alpha', icon: 'a.' },
  { label: 'Upper Alpha', value: 'upper-alpha', icon: 'A.' },
  { label: 'Lower Roman', value: 'lower-roman', icon: 'i.' },
  { label: 'Upper Roman', value: 'upper-roman', icon: 'I.' }
];

const ListControls = ({ execCommand }) => {
  const [listAnchorEl, setListAnchorEl] = useState(null);
  const [numberAnchorEl, setNumberAnchorEl] = useState(null);

  const handleListClick = (event) => {
    setListAnchorEl(event.currentTarget);
  };

  const handleNumberClick = (event) => {
    setNumberAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setListAnchorEl(null);
    setNumberAnchorEl(null);
  };

  const applyListStyle = (style) => {
    document.execCommand('insertUnorderedList');
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parent = range.commonAncestorContainer;
      
      if (parent.nodeType === 3) {
        parent = parent.parentElement;
      }
      
      const ul = parent.closest('ul');
      if (ul) {
        ul.style.listStyleType = style;
      }
    }
    handleClose();
  };

  const applyNumberStyle = (style) => {
    document.execCommand('insertOrderedList');
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parent = range.commonAncestorContainer;
      
      if (parent.nodeType === 3) {
        parent = parent.parentElement;
      }
      
      const ol = parent.closest('ol');
      if (ol) {
        ol.style.listStyleType = style;
      }
    }
    handleClose();
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip title="Bullet List">
        <IconButton 
          size="small"
          onClick={handleListClick}
          className="text-gray-700 hover:bg-gray-100"
        >
          <List size={20} />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={listAnchorEl}
        open={Boolean(listAnchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {listStyles.map((style) => (
          <MenuItem 
            key={style.value} 
            onClick={() => applyListStyle(style.value)}
            sx={{ minWidth: '150px' }}
          >
            <ListItemIcon sx={{ minWidth: '32px', fontSize: '1.2rem' }}>
              {style.icon}
            </ListItemIcon>
            <ListItemText>{style.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title="Numbered List">
        <IconButton 
          size="small"
          onClick={handleNumberClick}
          className="text-gray-700 hover:bg-gray-100"
        >
          <ListOrdered size={20} />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={numberAnchorEl}
        open={Boolean(numberAnchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {numberStyles.map((style) => (
          <MenuItem 
            key={style.value} 
            onClick={() => applyNumberStyle(style.value)}
            sx={{ minWidth: '150px' }}
          >
            <ListItemIcon sx={{ minWidth: '32px', fontSize: '1.2rem' }}>
              {style.icon}
            </ListItemIcon>
            <ListItemText>{style.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default ListControls;
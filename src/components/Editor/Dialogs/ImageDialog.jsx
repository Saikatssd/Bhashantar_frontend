import React from 'react';
import { X } from 'lucide-react';

const ImageDialog = ({ imageConfig, setImageConfig, insertImage, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setImageConfig((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Insert Image</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          name="url"
          placeholder="Image URL"
          value={imageConfig.url}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="alt"
          placeholder="Alt text"
          value={imageConfig.alt}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            name="width"
            placeholder="Width"
            value={imageConfig.width}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="height"
            placeholder="Height"
            value={imageConfig.height}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={insertImage}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Insert Image
        </button>
      </div>
    </div>
  );
};

export default ImageDialog;

import { FolderIcon } from "lucide-react";

export const FolderList = ({ folders = [], onFolderClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => onFolderClick(folder)}
          className="flex flex-col items-center p-4 rounded-xl
                       bg-white/10 backdrop-blur-sm border border-white/20
                       hover:bg-white/20 hover:shadow-md
                       transition-shadow cursor-pointer"
        >
          <FolderIcon size={40} className="blue-600" />
          <h3 className="mt-3 text-lg font-semibold text-black">
            {folder.name}
          </h3>
        </div>
      ))}
    </div>
  );
};

import React, { useState, useRef, type ChangeEvent } from "react";
import "../../assets/css/Ai-Chatpot.css"
interface FileUploaderProps {
  onUpload: (file: File) => void;
  accept?: string; // e.g. "image/*,application/pdf"
  multiple?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  accept,
  multiple = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (!multiple) {
      onUpload(files[0]);
    } else {
      files.forEach((file) => onUpload(file));
    }
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Circular Button */}
      <div
        onClick={triggerFileSelect}
        className="uploader"
      >
        +
      </div>

      {/* Selected Files */}
      {/* {selectedFiles.length > 0 && (
        <ul style={{ marginTop: "10px", textAlign: "center" }}>
          {selectedFiles.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default FileUploader;

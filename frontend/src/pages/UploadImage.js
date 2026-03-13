import { useState, useRef } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";

const UploadImage = () => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const abortRef = useRef(null);
  const [isUploading, setUploading] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);
    setFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    setFile(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    try {
      const abortController = new AbortController();
      abortRef.current = abortController;
      formData.append("file", file);
      setUploading(true)
      const res = await axiosPrivate.post("/image/upload", formData, {
        signal: abortController.signal,
      });
      console.log(res);
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }
      console.error(err);
    } finally {
      abortRef.current = null;
      setUploading(false)
    }
  };

  const handleCancel = async () => {
    abortRef.current?.abort();
    setUploading(false)
  };

  return (
    <div className="flex items-center justify-center h-full flex-col">
      <p className="text-xl text-bold m-2">Upload File</p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className="flex items-center justify-center w-1/2 h-1/2 border-2"
      >
        Drop file here or click
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <p>{fileName && "File: " + fileName}</p>
      <div className="flex w-1/2 gap-5">
        <button
          className="w-full p-2 border-2 my-2     disabled:border-gray-400
    disabled:text-gray-400
    disabled:bg-gray-100
    disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!file}
        >
          Upload
        </button>
        <button
          className="
    w-full p-2 border-2 my-2 border-red-600 text-red-600
    disabled:border-red-300
    disabled:text-red-400
    disabled:bg-red-100
    disabled:cursor-not-allowed
  "
          onClick={handleCancel}
          disabled={!isUploading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadImage;

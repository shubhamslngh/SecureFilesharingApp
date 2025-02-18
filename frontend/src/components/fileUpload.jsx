import { useState } from "react";
import LogoutButton from "./logout";

// Utility functions for encryption
const utils = {
  // Convert ArrayBuffer to hex string
  arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  // Get encryption key (derive a proper 256-bit key)
  async getKey() {
    const encoder = new TextEncoder();
    const passphrase = "your secret passphrase"; // Change this to your actual passphrase
    const keyMaterial = encoder.encode(passphrase);
    // Derive a 256-bit key from the passphrase
    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      keyMaterial
    );
    return await window.crypto.subtle.importKey(
      "raw",
      hashBuffer,
      { name: "AES-CBC" },
      false,
      ["encrypt"] // Add "decrypt" if needed later
    );
  },
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const accessToken = localStorage.getItem("access_token"); // Get token from localStorage

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setIsUploading(true);
    try {
      // Step 1: Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      const ivString = utils.arrayBufferToHex(iv);

      // Step 2: Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Step 3: Get encryption key
      const key = await utils.getKey();

      // Step 4: Encrypt file using AES-CBC
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv: iv,
        },
        key,
        fileBuffer
      );

      // Step 5: Prepare FormData and send encrypted file
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([encryptedData], { type: "application/octet-stream" }),
        file.name
      );
      formData.append("iv", ivString);

      const response = await fetch("http://localhost:8000/api/upload-file/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      alert("File uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-1 m-2 ease-in-out transition-2s ease-in-out hover:scale-105 w-1/2 place-self-center justify-items-center bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Upload File</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2 p-2 border w-full"
        disabled={isUploading}
      />
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        onClick={handleUpload}
        disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      <LogoutButton />
    </div>
  );
};

export default FileUpload;

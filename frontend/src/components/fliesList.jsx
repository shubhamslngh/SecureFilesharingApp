import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setFiles } from "../store/fileSlice";
import { FiEye, FiShare2, FiDownload, FiTrash2 } from "react-icons/fi";
import CryptoJS from "crypto-js";

const FileList = () => {
  const dispatch = useDispatch();
  // Assuming your auth slice includes both accessToken and user info.
  const { accessToken, user } = useSelector((state) => state.auth);
  const { files } = useSelector((state) => state.file);
  console.log("User:", user);

  // Local state for sharing modal and share form
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFileId, setShareFileId] = useState(null);
  const [shareForm, setShareForm] = useState({
    sharedWith: [],
    permission: "view",
    expiresIn: 60,
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch uploaded files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/uploads/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        dispatch(setFiles(response.data.files));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchFiles();
  }, [dispatch, accessToken]);

  // Fetch available users when share modal is opened
  useEffect(() => {
    if (shareModalOpen) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/users/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setAvailableUsers(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [shareModalOpen, accessToken]);

  // Handle file viewing
  const handleView = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  // Open the share modal and store the file ID to be shared
  const openShareModal = (fileId) => {
    setShareFileId(fileId);
    setShareModalOpen(true);
  };

  // Handle changes in the share form for text/select inputs
  const handleShareFormChange = (e) => {
    const { name, value } = e.target;
    setShareForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in the multi-select (for choosing users)
  const handleSharedWithChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setShareForm((prev) => ({ ...prev, sharedWith: selected }));
  };

  // Submit the share form to the backend
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        file_id: shareFileId,
        shared_with: shareForm.sharedWith, // array of user IDs
        permission: shareForm.permission,
        expires_in: shareForm.expiresIn,
      };
      const res = await axios.post(
        "http://localhost:8000/api/create-share/",
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      alert(`Share link: ${res.data.share_link}`);
      // Reset and close modal
      setShareModalOpen(false);
      setShareFileId(null);
      setShareForm({ sharedWith: [], permission: "view", expiresIn: 60 });
    } catch (err) {
      console.error("Error creating share link:", err);
      alert("Failed to create share link.");
    }
  };

  // Handle file download & decryption
  const handleDownload = async (fileId, fileName, fileType) => {
    try {
      // Step 1: Fetch the IV
      const getIv = await axios.get(
        `http://localhost:8000/api/download/${fileId}/iv`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "json",
        }
      );
      let ivString = getIv.data.iv;
      console.log("IV:", ivString);
      // Convert IV from hex to CryptoJS format
      let iv = CryptoJS.enc.Hex.parse(ivString);

      // Step 2: Fetch the Encrypted File (as arraybuffer)
      const res = await axios.get(
        `http://localhost:8000/api/download/${fileId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "arraybuffer",
        }
      );
      let encryptedData = new Uint8Array(res.data);
      console.log("Encrypted File Data:", encryptedData);

      // Convert Uint8Array to CryptoJS WordArray
      let encryptedWordArray = CryptoJS.lib.WordArray.create(encryptedData);

      // Secret Key: Derive a 256-bit key from your passphrase
      const passphrase = "your secret passphrase"; // Use a strong passphrase
      const key = CryptoJS.SHA256(passphrase);

      // Step 3: Decrypt using AES-CBC
      let decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedWordArray },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      // Convert decrypted WordArray to Uint8Array
      let decryptedBytes = wordArrayToUint8Array(decrypted);
      console.log("Decrypted Data:", decryptedBytes);

      // Step 4: Create Blob with the correct MIME type & trigger download
      const url = window.URL.createObjectURL(
        new Blob([decryptedBytes], {
          type: fileType || "application/octet-stream",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "decrypted_file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading or decrypting file:", err);
    }
  };

  // Handle file deletion (only visible for admins)
  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete/${fileId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("File deleted successfully.");
      // Update local file list by filtering out the deleted file
      dispatch(setFiles(files.filter((file) => file.id !== fileId)));
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file.");
    }
  };

  // Utility: Convert CryptoJS WordArray to Uint8Array
  function wordArrayToUint8Array(wordArray) {
    let words = wordArray.words;
    let sigBytes = wordArray.sigBytes;
    let u8 = new Uint8Array(sigBytes);
    let index = 0;
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      u8[index++] = (word >> 24) & 0xff;
      u8[index++] = (word >> 16) & 0xff;
      u8[index++] = (word >> 8) & 0xff;
      u8[index++] = word & 0xff;
    }
    return u8.subarray(0, sigBytes);
  }

  return (
    <div className="h-100vh overflow-scroll m-10 place-self-center justify-items-center mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Your Files</h2>
      {files.length === 0 ? (
        <p className="text-slate-500">No files found.</p>
      ) : (
        <div className="overflow-scroll w-full p-2 ">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2">File Name</th>
                <th className="py-2">Uploaded By</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-100 border-2 bg-slate-300 ease-in-out transition-2s border-b border-gray-100">
                  <td className="p-2">{file.file}</td>
                  <td className="p-2">{file.uploaded_by || "Unknown"}</td>
                  <td className="p-2 flex space-x-2">
                    {/* View Icon */}
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleView(file.file)}
                      title="View File">
                      <FiEye size={18} />
                    </button>
                    {/* Share Icon */}
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openShareModal(file.id)}
                      title="Share File">
                      <FiShare2 size={18} />
                    </button>
                    {/* Download Icon */}
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDownload(file.id, file.file, file.mime_type)
                      }
                      title="Download File">
                      <FiDownload size={18} />
                    </button>
                    {/* Delete Icon (Visible only for Admins) */}
                    {user === "admin" && (
                      <button
                        className="text-gray-700 hover:text-gray-900"
                        onClick={() => handleDelete(file.id)}
                        title="Delete File">
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Share File</h3>
            <form onSubmit={handleShareSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Select Users to Share With:
                </label>
                <select
                  multiple
                  name="sharedWith"
                  value={shareForm.sharedWith}
                  onChange={handleSharedWithChange}
                  className="w-full border rounded p-2">
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Permission:
                </label>
                <select
                  name="permission"
                  value={shareForm.permission}
                  onChange={handleShareFormChange}
                  className="w-full border rounded p-2">
                  <option value="view">View</option>
                  <option value="download">Download</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Expires In (minutes):
                </label>
                <input
                  type="number"
                  name="expiresIn"
                  value={shareForm.expiresIn}
                  onChange={handleShareFormChange}
                  className="w-full border rounded p-2"
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded">
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;

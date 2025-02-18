const generateShareableLink = async (fileId, token) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/share/${fileId}/`,
      { permission: "view", expiry_minutes: 120 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Shareable link: http://localhost:8000/api/download/${fileId}/`);
  } catch (error) {
    console.error("Error generating shareable link:", error);
  }
};
export default generateShareableLink;
import { useState } from "react";
import axios from "axios";

const ShareFile = ({ fileId }) => {
    const [email, setEmail] = useState("");
    const [expiry, setExpiry] = useState(24);

    const handleShare = async () => {
        const response = await axios.post(`http://localhost:8000/share/${fileId}`, { email, expiry }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        alert(`File shared successfully with ${email}!`);
    };

    return (
        <div>
            <h3>Share File</h3>
            <input type="email" placeholder="User Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="number" placeholder="Expiry (hours)" onChange={(e) => setExpiry(e.target.value)} />
            <button onClick={handleShare}>Share</button>
        </div>
    );
};

export default ShareFile;

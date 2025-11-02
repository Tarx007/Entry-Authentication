import React, { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleVerify = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch("http://127.0.0.1:5000/api/verify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Face Authentication</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleVerify}>Verify</button>
      <pre>{result}</pre>
    </div>
  );
}

export default App;

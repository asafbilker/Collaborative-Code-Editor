import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://moveo-project-v3tk.onrender.com';

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/codeblocks`)
      .then((response) => response.json())
      .then((data) => setCodeBlocks(data))
      .catch((error) => console.error('Error fetching code blocks:', error));
  }, []);

  return (
    <div>
      <h1>Choose a Code Block</h1>
      <ul>
        {codeBlocks.map((block) => (
          <li key={block._id}>
            <button onClick={() => navigate(`/codeblock/${block._id}`)}>
              {block.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;

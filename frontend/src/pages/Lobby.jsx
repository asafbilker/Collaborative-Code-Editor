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
    <div
      style={{
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '36px', marginBottom: '40px' }}>
        Choose a Code Block
      </h1>

      <div
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '5px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {codeBlocks.map((block) => (
            <button
              key={block._id}
              onClick={() => navigate(`/codeblock/${block._id}`)}
              style={{
                padding: '15px 20px',
                fontSize: '18px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#e0e0e0')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#f0f0f0')
              }
            >
              {block.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby;

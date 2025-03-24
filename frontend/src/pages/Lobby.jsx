import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://moveo-project-v3tk.onrender.com';

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: '',
    initialCode: '',
    solution: '',
    description: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/codeblocks`)
      .then((res) => res.json())
      .then(setCodeBlocks)
      .catch((err) => console.error('Error fetching code blocks:', err));
  }, []);

  const handleAddBlock = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_BASE_URL}/api/codeblocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBlock),
    });

    if (response.ok) {
      const createdBlock = await response.json();
      setCodeBlocks((prev) => [...prev, createdBlock]);
      setNewBlock({ title: '', initialCode: '', solution: '', description: '' });
      setShowForm(false);
    } else {
      console.error('Failed to create code block');
    }
  };

  return (
    <div
      style={{
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Choose a Code Block</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '30px',
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '8px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {showForm ? 'Cancel' : '➕ Add New Code Block'}
      </button>

      {showForm && (
        <form onSubmit={handleAddBlock} style={{ marginBottom: '30px', textAlign: 'left' }}>
          {['title', 'description', 'initial Code', 'solution'].map((field) => (
            <div key={field} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <textarea
                rows={field === 'description' ? 2 : 4}
                required
                value={newBlock[field]}
                onChange={(e) => setNewBlock({ ...newBlock, [field]: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '5px' }}
              />
            </div>
          ))}
          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✅ Create Block
          </button>
        </form>
      )}

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

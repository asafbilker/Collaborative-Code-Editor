import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { io } from 'socket.io-client';

const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://moveo-project-v3tk.onrender.com';

console.log(`🌍 API_BASE_URL resolved to: ${API_BASE_URL}`);
const socket = io(API_BASE_URL);

const CodeBlockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [role, setRole] = useState(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    socket.emit('joinRoom', id);
    console.log(`🚪 Emitted joinRoom for room ID: ${id}`);

    fetch(`${API_BASE_URL}/api/codeblocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('📦 Received code block data:', data);
        setCodeBlock(data);
        const timeout = setTimeout(() => {
          setCode((prev) => prev || data.initialCode);
        }, 300);
      })
      .catch((error) => console.error('❌ Error fetching code block:', error));

    socket.on('roleAssigned', (assignedRole) => {
      console.log(`🎭 FINAL Role assigned to this user: ${assignedRole}`);
      setRole(assignedRole);
    });

    socket.on('updateStudentCount', (count) => {
      console.log(`👥 Student count updated: ${count}`);
      setStudentCount(count);
    });

    socket.on('codeUpdate', (updatedCode) => {
      console.log(`✍️ Received code update`);
      setCode(updatedCode);
      if (codeBlock && updatedCode.trim() === codeBlock.solution.trim()) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    });

    socket.on('mentorLeft', () => {
      console.log('🚨 Mentor left the room. Redirecting...');
      navigate('/');
    });

    return () => {
      socket.off('codeUpdate');
      socket.off('roleAssigned');
      socket.off('updateStudentCount');
      socket.off('mentorLeft');
      socket.emit('leaveRoom', id);
      console.log(`🏃‍♂️ Emitted leaveRoom for room ID: ${id}`);
    };
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('codeChange', { id, newCode });
    console.log(`📤 Emitted codeChange`);

    if (codeBlock && newCode.trim() === codeBlock.solution.trim()) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  if (!codeBlock) return <h1>Loading...</h1>;

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>{codeBlock.title}</h1>

      {role && (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>
          <strong>Role:</strong>{' '}
          <span
            style={{
              color: '#fff',
              backgroundColor: role === 'Mentor' ? '#007bff' : '#28a745',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 'bold',
            }}
          >
            {role}
          </span>
        </p>
      )}

      <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
        Students in room: <strong>{studentCount}</strong>
      </p>

      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={handleCodeChange}
        readOnly={role === 'Mentor'}
      />

      {isCorrect && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h1 style={{ fontSize: '70px', color: 'green' }}>😃</h1>
        </div>
      )}
    </div>
  );
};

export default CodeBlockPage;

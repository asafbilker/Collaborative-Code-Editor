import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { io } from 'socket.io-client';

// use local server in dev, live server in prod
const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://moveo-project-v3tk.onrender.com';

const socket = io(API_BASE_URL);

const CodeBlockPage = () => {
  const { id } = useParams(); // get room id from URL
  const navigate = useNavigate();

  const [codeBlock, setCodeBlock] = useState(null); // holds the current block info
  const [code, setCode] = useState(''); // live code in editor
  const [isCorrect, setIsCorrect] = useState(false); // if code matches solution
  const [role, setRole] = useState(null); // 'Mentor' or 'Student'
  const [studentCount, setStudentCount] = useState(0); // number of students in room
  const [showSolution, setShowSolution] = useState(false); // show solution option

  useEffect(() => {
    socket.emit('joinRoom', id); // enter room

    // gets code block data from db
    fetch(`${API_BASE_URL}/api/codeblocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCodeBlock(data);
        setCode((prev) => prev || data.initialCode);
      })
      .catch((error) => console.error('Error fetching code block:', error));

    // setup of the sockets
    socket.on('roleAssigned', setRole);
    socket.on('updateStudentCount', setStudentCount);
    socket.on('codeUpdate', (updatedCode) => {
      setCode(updatedCode);
      if (codeBlock && updatedCode.trim() === codeBlock.solution.trim()) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    });

    socket.on('mentorLeft', () => navigate('/')); // if mentor leaves

    return () => {
      socket.off('codeUpdate');
      socket.off('roleAssigned');
      socket.off('updateStudentCount');
      socket.off('mentorLeft');
      socket.emit('leaveRoom', id); // clean when exit
    };
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('codeChange', { id, newCode }); // send change to others

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
      {/* block title */}
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>{codeBlock.title}</h1>

      {/* option for block description */}
      {codeBlock.description && (
        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px', color: '#555' }}>
          {codeBlock.description}
        </p>
      )}

      {/* show role (mentor/student) */}
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

      {/* student count */}
      <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
        Students in room: <strong>{studentCount}</strong>
      </p>

      {/* success smiley if correct */}
      {isCorrect && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <h1 style={{ fontSize: '70px', color: 'green' }}>😃</h1>
        </div>
      )}

      {/* main code editor */}
      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={handleCodeChange}
        readOnly={role === 'Mentor'}
      />

      {/* show solution view */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => setShowSolution((prev) => !prev)}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            backgroundColor: '#6c63ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>

        {/* solution data */}
        {showSolution && codeBlock && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              paste the following code exactly in the editor to trigger the smiley:
            </p>
            <pre
              style={{
                backgroundColor: '#f4f4f4',
                padding: '15px',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '14px',
              }}
            >
              <code>{codeBlock.solution}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlockPage;

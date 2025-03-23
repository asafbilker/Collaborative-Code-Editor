import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { io } from 'socket.io-client';

const socket = io('https://moveo-project-v3tk.onrender.com');

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
        console.log(`Joined room: ${id}`);

        fetch(`https://moveo-project-v3tk.onrender.com/api/codeblocks/${id}`)
            .then(response => response.json())
            .then(data => {
                setCodeBlock(data);

                // ⚠️ Don't setCode here. Wait for possible socket codeUpdate
                // Instead, set initial fallback after short timeout (if no socket update arrives)
                const timeout = setTimeout(() => {
                    setCode(prev => prev || data.initialCode);
                }, 300); // short delay fallback

            })
            .catch(error => console.error('Error fetching code block:', error));

        socket.on('roleAssigned', (assignedRole) => {
            console.log(`Role assigned to this user: ${assignedRole}`);
            setRole(assignedRole);
        });

        socket.on('updateStudentCount', (count) => {
            console.log(`Student count updated: ${count}`);
            setStudentCount(count);
        });

        socket.on('codeUpdate', (updatedCode) => {
            setCode(updatedCode);
            if (codeBlock && updatedCode.trim() === codeBlock.solution.trim()) {
                setIsCorrect(true);
            } else {
                setIsCorrect(false);
            }
        });

        socket.on('mentorLeft', () => {
            console.log('Mentor left the room. Redirecting to lobby...');
            navigate('/');
        });

        return () => {
            socket.off('codeUpdate');
            socket.off('roleAssigned');
            socket.off('updateStudentCount');
            socket.off('mentorLeft');
            socket.emit('leaveRoom', id);
        };
    }, [id]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        socket.emit('codeChange', { id, newCode });

        if (codeBlock && newCode.trim() === codeBlock.solution.trim()) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    if (!codeBlock) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>{codeBlock.title}</h1>
            {role && <p><strong>Role:</strong> {role}</p>}
            <p>Students in room: {studentCount}</p>
            <CodeMirror
                value={code}
                height="300px"
                extensions={[javascript()]}
                onChange={handleCodeChange}
                readOnly={role === 'Mentor'}
            />
            {isCorrect && <h1 style={{ fontSize: '50px', color: 'green' }}>😃</h1>}
        </div>
    );
};

export default CodeBlockPage;

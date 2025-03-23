import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch code blocks from the backend
        fetch('http://localhost:5000/api/codeblocks')
            .then(response => response.json())
            .then(data => setCodeBlocks(data))
            .catch(error => console.error('Error fetching code blocks:', error));
    }, []);

    return (
        <div>
            <h1>Choose a Code Block</h1>
            <ul>
                {codeBlocks.map(block => (
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

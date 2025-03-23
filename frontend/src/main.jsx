import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Lobby from './pages/Lobby';
import CodeBlockPage from './pages/CodeBlockPage';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/codeblock/:id" element={<CodeBlockPage />} />
            </Routes>
        </Router>
    </React.StrictMode>
);

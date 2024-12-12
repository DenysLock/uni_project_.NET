// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import AuthorManager from './AuthorManager';
import BorrowersManager from './BorrowersManager';
import BooksManager from './BooksManager';
import LoansManager from './LoansManager';
import NavBar from './NavBar'; // Import the NavBar
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/books" element={<BooksManager />} />
                <Route path="/authors" element={<AuthorManager />} />
                <Route path="/borrowers" element={<BorrowersManager />} />
                <Route path="/loans" element={<LoansManager />} />
                <Route path="/" element={<AuthorManager />} /> {/* Redirect to books by default */}
            </Routes>
        </Router>
    );
};

export default App;

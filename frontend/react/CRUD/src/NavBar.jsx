import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <div className="navbar-nav mx-auto">
                    <Link className="nav-link" to="/books">Books</Link>
                    <Link className="nav-link" to="/authors">Authors</Link>
                    <Link className="nav-link" to="/borrowers">Borrowers</Link>
                    <Link className="nav-link" to="/loans">Loans</Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;

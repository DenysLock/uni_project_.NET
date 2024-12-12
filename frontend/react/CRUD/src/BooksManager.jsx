import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthorManager.css'; // Importing CSS file for styles

const AuthorManager = () => {
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentAuthor, setCurrentAuthor] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAuthors();
        fetchBooks2(); // Добавьте вызов для получения списка авторов
    }, []);

    const fetchBooks2 = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/Library/books'); // URL для получения авторов
            setBooks(response.data);
            setErrorMessage('');
        } catch (error) {
            console.error("Error fetching authors", error);
            setErrorMessage('Failed to fetch authors. Please try again.');
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/Library/authors'); // URL для получения авторов
            setAuthors(response.data);
            setErrorMessage('');
        } catch (error) {
            console.error("Error fetching authors", error);
            setErrorMessage('Failed to fetch authors. Please try again.');
        }
    };

    const handleAddAuthor = async (newAuthor) => {
    try {
        await axios.post('https://localhost:7024/api/Library/books', newAuthor);
        await fetchBooks2(); // Обновляем список книг после добавления новой
        setShowAddModal(false);
        setErrorMessage('');
    } catch (error) {
        console.error("Error adding author", error);
        setErrorMessage(error.response.data);
    }
};


    const handleEditAuthor = async (updatedAuthor) => {
        try {
            await axios.put(`https://localhost:7024/api/Library/books/${currentAuthor.bookId}`, updatedAuthor);
            fetchBooks2();
            setShowEditModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error("Error updating author", error);
            setErrorMessage('Failed to update author. Please try again.');
        }
    };

    const handleDeleteAuthors = async () => {
        if (!currentAuthor || !currentAuthor.bookId) {
            setErrorMessage('No author selected for deletion.');
            return;
        }
    
        try {
            await axios.delete(`https://localhost:7024/api/Library/books/${currentAuthor.bookId}`);
            fetchBooks2();
            setShowDeleteModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error("Error deleting author", error);
            setErrorMessage('Failed to delete author. Please try again.');
        }
    };
    

    return (
        <div className="container text-center">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="table-responsive">
                <div className="table-wrapper mx-auto">
                    <div className="table-title">
                        <div className="row">
                            <div className="col-xs-12">
                                <h2>Manage <b>Books</b></h2>
                            </div>
                            <div className="col-xs-12">
                                <button className="btn btn-success" onClick={() => setShowAddModal(true)}>Add New Author</button>
                            </div>
                        </div>
                    </div>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>bookId</th>
                                <th>authorId</th>
                                <th>genre</th>
                                <th>publishedDate</th>
                                <th>Title</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(author => (
                                <tr key={author.bookId}>
                                    <td>{author.bookId}</td>
                                    <td>{author.authorId}</td>
                                    <td>{author.genre}</td>
                                    <td>{new Date(author.publishedDate).toLocaleDateString('ua-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td>{author.title}</td>
                                    <td>
                                        <button onClick={() => { setCurrentAuthor(author); setShowEditModal(true); }}>Edit</button>
                                        <button onClick={() => {
                                            console.log('Selected Author:', author);
                                            setCurrentAuthor(author);
                                            setShowDeleteModal(true);
                                        }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <Modal title="Add Book" onClose={() => setShowAddModal(false)}>
                    <AuthorForm onSubmit={handleAddAuthor} authors={authors} errorMessage={errorMessage} />
                </Modal>
            )}

            {showEditModal && currentAuthor && (
                <Modal title="Edit Book" onClose={() => setShowEditModal(false)}>
                    <AuthorForm 
                        onSubmit={handleEditAuthor} 
                        initialValues={currentAuthor} 
                        authors={authors} 
                        errorMessage={errorMessage}
                    />
                </Modal>
            )}

            {showDeleteModal && (
                <Modal title="Delete Author" onClose={() => setShowDeleteModal(false)}>
                    <p>Are you sure you want to delete this author?</p>
                    <button onClick={handleDeleteAuthors}>Delete</button>
                </Modal>
            )}
        </div>
    );
};

const Modal = ({ title, onClose, children }) => {
    return (
        <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{title}</h4>
                        <button className="close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-default" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthorForm = ({ onSubmit, initialValues = {}, errorMessage, authors }) => {
    const [title, setTitle] = useState(initialValues.title || '');
    const [authorId, setAuthorId] = useState(initialValues.authorId || '');
    const [genre, setGenre] = useState(initialValues.genre || '');
    const [publishedDate, setPublishedDate] = useState(
        initialValues.publishedDate ? initialValues.publishedDate.split('T')[0] : ''
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ title, authorId, genre, publishedDate });
    };

    return (
        <form onSubmit={handleSubmit}>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Author</label>
                <select
                    className="form-control"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    required
                >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                        <option key={author.authorId} value={author.authorId}>
                            {author.name} (ID: {author.authorId}) 
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Genre</label>
                <input
                    type="text"
                    className="form-control"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Published Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
};

export default AuthorManager;

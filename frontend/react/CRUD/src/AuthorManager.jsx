import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthorManager.css'; // Importing CSS file for styles

const AuthorManager = () => {
    const [authors, setAuthors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentAuthor, setCurrentAuthor] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Error message state

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/Library/authors');
            setAuthors(response.data);
            setErrorMessage(''); // Clear error message on successful fetch
        } catch (error) {
            console.error("Error fetching authors", error);
            setErrorMessage('Failed to fetch authors. Please try again.'); // Set error message
        }
    };

    const handleAddAuthor = async (newAuthor) => {
        try {
            await axios.post('https://localhost:7024/api/Library/authors', newAuthor);
            fetchAuthors();
            setShowAddModal(false);
            setErrorMessage(''); // Clear error message on success
        } catch (error) {
            console.error("Error adding author", error);
            setErrorMessage('Failed to add author. Please try again.'); // Set error message
        }
    };

    const handleEditAuthor = async (updatedAuthor) => {
        try {
            await axios.put(`https://localhost:7024/api/Library/authors/${currentAuthor.authorId}`, updatedAuthor);
            fetchAuthors(); // Refresh the list
            setShowEditModal(false);
            setErrorMessage(''); // Clear error message on success
        } catch (error) {
            console.error("Error updating author", error);
            setErrorMessage('Failed to update author. Please try again.'); // Set error message
        }
    };

    const handleDeleteAuthors = async () => {
        try {
            await axios.delete(`https://localhost:7024/api/Library/authors/${currentAuthor.authorId}`);
            fetchAuthors(); // Refresh the list
            setShowDeleteModal(false);
            setErrorMessage(''); // Clear error message on success
        } catch (error) {
            console.error("Error deleting author", error);
            setErrorMessage('Failed to delete author. Please try again.'); // Set error message
        }
    };

    return (
        <div className="container text-center">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Error message display */}
            <div className="table-responsive">
                <div className="table-wrapper mx-auto">
                    <div className="table-title">
                        <div className="row">
                            <div className="col-xs-12">
                                <h2>Manage <b>Authors</b></h2>
                            </div>
                            <div className="col-xs-12">
                                <button className="btn btn-success" onClick={() => setShowAddModal(true)}>Add New Author</button>
                            </div>
                        </div>
                    </div>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Author ID</th>
                                <th>Name</th>
                                <th>Bio</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authors.map(author => (
                                <tr key={author.authorId}>
                                    <td>{author.authorId}</td>
                                    <td>{author.name}</td>
                                    <td>{author.bio}</td>
                                    <td>
                                        <button onClick={() => { setCurrentAuthor(author); setShowEditModal(true); }}>Edit</button>
                                        <button onClick={() => { setCurrentAuthor(author); setShowDeleteModal(true); }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Author Modal */}
            {showAddModal && (
                <Modal title="Add Author" onClose={() => setShowAddModal(false)}>
                    <AuthorForm onSubmit={handleAddAuthor} errorMessage={errorMessage} />
                </Modal>
            )}

            {/* Edit Author Modal */}
            {showEditModal && currentAuthor && (
                <Modal title="Edit Author" onClose={() => setShowEditModal(false)}>
                    <AuthorForm 
                        onSubmit={handleEditAuthor} 
                        initialValues={currentAuthor} 
                        errorMessage={errorMessage} // Pass error message here too
                    />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal title="Delete Author" onClose={() => setShowDeleteModal(false)}>
                    <p>Are you sure you want to delete this author?</p>
                    <button onClick={handleDeleteAuthors}>Delete</button>
                </Modal>
            )}
        </div>
    );
};

// Modal Component
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

// Author Form Component
const AuthorForm = ({ onSubmit, initialValues = {}, errorMessage }) => {
    const [name, setName] = useState(initialValues.name || '');
    const [bio, setBio] = useState(initialValues.bio || '');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ name, bio });
    };

    return (
        <form onSubmit={handleSubmit}>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Error message display */}
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Bio</label>
                <textarea
                    className="form-control"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
};

export default AuthorManager;

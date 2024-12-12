import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthorManager.css'; // Импорт CSS для LoanManager

const LoanManager = () => {
    const [loans, setLoans] = useState([]);
    const [borrowers, setBorrowers] = useState([]); // Состояние для заемщиков
    const [books, setBooks] = useState([]); // Состояние для книг
    const [authors, setAuthors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentLoan, setCurrentLoan] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Состояние для ошибок
    const [loading, setLoading] = useState(true); // Состояние для загрузки данных

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([fetchLoans(), fetchBorrowers(), fetchBooks(), fetchAuthors()]);
            } catch (error) {
                console.error("Ошибка загрузки данных", error);
                setErrorMessage('Не удалось загрузить данные. Пожалуйста, попробуйте снова.');
            } finally {
                setLoading(false); // Устанавливаем состояние загрузки в false после завершения загрузки
            }
        };

        fetchData();
    }, []);

    const fetchLoans = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/library/loans');
            setLoans(response.data);
        } catch (error) {
            console.error("Ошибка получения списка займов", error);
            setErrorMessage('Не удалось получить данные займов. Пожалуйста, попробуйте снова.');
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/library/authors');
            setAuthors(response.data);
        } catch (error) {
            console.error("Ошибка получения списка авторов", error);
            setErrorMessage('Не удалось получить данные авторов.');
        }
    };

    const fetchBorrowers = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/library/borrowers');
            setBorrowers(response.data);
        } catch (error) {
            console.error("Ошибка получения заемщиков", error);
            setErrorMessage('Не удалось получить данные заемщиков.');
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://localhost:7024/api/library/books');
            setBooks(response.data);
        } catch (error) {
            console.error("Ошибка получения книг", error);
            setErrorMessage('Не удалось получить данные книг.');
        }
    };

    const handleAddLoan = async (newLoan) => {
        try {
            await axios.post('https://localhost:7024/api/library/loans', newLoan);
            fetchLoans();
            setShowAddModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error("Ошибка добавления займа", error);
            setErrorMessage(error.response.data || 'Не удалось добавить займ.');
        }
    };

    const handleEditLoan = async (updatedLoan) => {
        try {
            await axios.put(`https://localhost:7024/api/library/loans/${currentLoan.loanId}`, updatedLoan);
            fetchLoans();
            setShowEditModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error("Ошибка обновления займа", error);
            setErrorMessage(error.response.data || 'Не удалось обновить данные займа. Пожалуйста, попробуйте снова.');
        }
    };
    

    const handleDeleteLoan = async () => {
        if (!currentLoan || !currentLoan.loanId) {
            setErrorMessage('Заем для удаления не выбран.');
            return;
        }

        try {
            await axios.delete(`https://localhost:7024/api/library/loans/${currentLoan.loanId}`);
            fetchLoans();
            setShowDeleteModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error("Ошибка удаления займа", error);
            setErrorMessage('Не удалось удалить займ. Пожалуйста, попробуйте снова.');
        }
    };

    return (
        <div className="container text-center">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {loading ? (
                <div>Loading...</div> // Показываем загрузчик
            ) : (
                <div className="table-responsive">
                    <div className="table-wrapper mx-auto">
                        <div className="table-title">
                            <div className="row">
                                <div className="col-xs-12">
                                    <h2>Manage <b>Loans</b></h2>
                                </div>
                                <div className="col-xs-12">
                                    <button className="btn btn-success" onClick={() => setShowAddModal(true)}>Add New Loan</button>
                                </div>
                            </div>
                        </div>
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Loan ID</th>
                                    <th>Book ID</th>
                                    <th>Borrower ID</th>
                                    <th>Loan Date</th>
                                    <th>Return Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map(loan => (
                                    <tr key={loan.loanId}>
                                        <td>{loan.loanId}</td>
                                        <td>{loan.bookId}</td>
                                        <td>{loan.borrowerId}</td>
                                        <td>{new Date(loan.loanDate).toLocaleDateString('ua-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                        <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString('ua-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Not Returned'}</td>
                                        <td>
                                            <button onClick={() => { setCurrentLoan(loan); setShowEditModal(true); }}>Edit</button>
                                            <button onClick={() => {
                                                setCurrentLoan(loan);
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
            )}

            {/* Modal для добавления займа */}
            {showAddModal && (
                <Modal title="Add Loan" onClose={() => setShowAddModal(false)}>
                    <LoanForm
                        onSubmit={handleAddLoan}
                        borrowers={borrowers} // Передаем заемщиков
                        books={books} // Передаем книги
                        authors={authors} // Передаем авторов
                        errorMessage={errorMessage}
                    />
                </Modal>
            )}

            {/* Modal для редактирования займа */}
            {showEditModal && currentLoan && (
                <Modal title="Edit Loan" onClose={() => setShowEditModal(false)}>
                    <LoanForm
                        onSubmit={handleEditLoan}
                        initialValues={currentLoan}
                        borrowers={borrowers} // Передаем заемщиков
                        books={books} // Передаем книги
                        authors={authors} // Передаем авторов
                        errorMessage={errorMessage}
                    />
                </Modal>
            )}

            {/* Modal для подтверждения удаления займа */}
            {showDeleteModal && (
                <Modal title="Delete Loan" onClose={() => setShowDeleteModal(false)}>
                    <p>Are you sure you want to delete this loan?</p>
                    <button onClick={handleDeleteLoan}>Delete</button>
                </Modal>
            )}
        </div>
    );
};

// Компонент Modal
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

// Компонент формы займа
const LoanForm = ({ onSubmit, initialValues = {}, borrowers, books, authors, errorMessage }) => {
    const [bookId, setBookId] = useState(initialValues.bookId || '');
    const [borrowerId, setBorrowerId] = useState(initialValues.borrowerId || '');
    const [loanDate, setLoanDate] = useState(initialValues.loanDate ? initialValues.loanDate.split('T')[0] : '');
    const [returnDate, setReturnDate] = useState(initialValues.returnDate ? initialValues.returnDate.split('T')[0] : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const loanData = {
            bookId,
            borrowerId,
            loanDate,
            returnDate: returnDate || null, // Убедитесь, что если нет даты, то передаете null
        };
        onSubmit(loanData);
    };
    

    return (
        <form onSubmit={handleSubmit}>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="form-group">
                <label>Book</label>
                <select
                    className="form-control"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    required
                >
                    <option value="">Select Book</option>
                    {books.map(book => {
                        const author = authors.find(author => author.authorId === book.authorId);
                        return (
                            <option key={book.bookId} value={book.bookId}>
                                {book.bookId} - {book.title} - Author: {author ? author.name : 'Unknown'}, Genre: {book.genre}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="form-group">
                <label>Borrower</label>
                <select
                    className="form-control"
                    value={borrowerId}
                    onChange={(e) => setBorrowerId(e.target.value)}
                    required
                >
                    <option value="">Select Borrower</option>
                    {borrowers.map(borrower => (
                        <option key={borrower.borrowerId} value={borrower.borrowerId}>
                            {borrower.borrowerId} - {borrower.firstName} {borrower.lastName} - {borrower.email}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Loan Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Return Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
};

export default LoanManager;

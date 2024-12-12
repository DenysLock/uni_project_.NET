using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using WebApplication2.Models;
using Microsoft.Extensions.Configuration;




namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LibraryController : ControllerBase
    {
        private readonly LibraryContext _context;
        private readonly string _connectionString;

        public LibraryController(LibraryContext context, IConfiguration configuration)
        {
            _context = context;
            _logger = new Logger("logs.txt");
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private readonly Logger _logger;

        public int AddBorrower(Borrower borrower)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                SqlCommand command = new SqlCommand("AddBorrower", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@FirstName", borrower.FirstName);
                command.Parameters.AddWithValue("@LastName", borrower.LastName);
                command.Parameters.AddWithValue("@Email", borrower.Email ?? (object)DBNull.Value);

                return (int)command.ExecuteScalar();
            }
        }

        
        public List<Borrower> GetBorrowersFromDatabase()
        {
            var borrowers = new List<Borrower>();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                SqlCommand command = new SqlCommand("GetAllBorrowers", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var borrower = new Borrower
                        {
                            BorrowerId = reader.GetInt32(reader.GetOrdinal("BorrowerId")),
                            FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                            LastName = reader.GetString(reader.GetOrdinal("LastName")),
                            Email = reader.IsDBNull(reader.GetOrdinal("Email")) ? null : reader.GetString(reader.GetOrdinal("Email"))
                        };
                        borrowers.Add(borrower);
                    }
                }
            }

            return borrowers;
        }


        // GET: api/library/borrowers
        [HttpGet("borrowers")]
        public async Task<ActionResult<IEnumerable<Borrower>>> GetBorrowers()
        {
            await _logger.LogEventAsync("borrowers retrieved");

            var borrowers = GetBorrowersFromDatabase();

            return Ok(borrowers);
        }

        // POST: api/library/borrowers
        [HttpPost("borrowers")]
        public ActionResult<Borrower> PostBorrower([FromBody] Borrower borrower)
        {
            if (borrower == null)
            {
                return BadRequest("Borrower cannot be null.");
            }

            borrower.BorrowerId = AddBorrower(borrower);

            return CreatedAtAction(nameof(GetBorrowers), new { id = borrower.BorrowerId }, borrower);
        }


        // PUT: api/library/borrowers/{id}
        [HttpPut("borrowers/{id}")]
        public async Task<ActionResult> PutBorrower(int id, [FromBody] Borrower updatedBorrower)
        {
            if (updatedBorrower == null)
            {
                return BadRequest("Borrower cannot be null.");
            }

            var existingBorrower = await _context.Borrowers.FindAsync(id);
            if (existingBorrower == null)
            {
                return NotFound();
            }

            existingBorrower.FirstName = updatedBorrower.FirstName;
            existingBorrower.LastName = updatedBorrower.LastName;
            existingBorrower.Email = updatedBorrower.Email;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/library/borrowers/{id}
        [HttpDelete("borrowers/{id}")]
        public async Task<ActionResult> DeleteBorrower(int id)
        {
            var borrower = await _context.Borrowers.FindAsync(id);
            if (borrower == null)
            {
                return NotFound();
            }

            _context.Borrowers.Remove(borrower);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/library/authors/count
        [HttpGet("authors/count")]
        public async Task<ActionResult<int>> GetAuthorCount()
        {
            return await _context.Authors.CountAsync();
        }

        // GET: api/library/authors
        [HttpGet("authors")]
        public async Task<ActionResult<IEnumerable<Author>>> GetAuthors()
        {
            return await _context.Authors.ToListAsync();
        }

        // POST: api/library/authors
        [HttpPost("authors")]
        public async Task<ActionResult<Author>> PostAuthor([FromBody] Author author)
        {
            if (author == null)
            {
                return BadRequest("Author cannot be null.");
            }

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAuthors), new { id = author.AuthorId }, author);
        }

        // DELETE: api/library/authors/{id}
        [HttpDelete("authors/{id}")]
        public async Task<ActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
            {
                return NotFound();
            }

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/library/authors/{id}
        [HttpPut("authors/{id}")]
        public async Task<ActionResult> PutAuthor(int id, [FromBody] Author updatedAuthor)
        {
            if (updatedAuthor == null)
            {
                return BadRequest("Author cannot be null.");
            }

            var existingAuthor = await _context.Authors.FindAsync(id);
            if (existingAuthor == null)
            {
                return NotFound();
            }

            existingAuthor.Name = updatedAuthor.Name;
            existingAuthor.Bio = updatedAuthor.Bio;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/library/books
        [HttpGet("books")]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books.ToListAsync();
        }

        // POST: api/library/books
        [HttpPost("books")]
        public async Task<ActionResult<Book>> PostBook([FromBody] Book book)
        {
            if (book == null)
            {
                return BadRequest("Book cannot be null.");
            }

            // Перевірка наявності автора
            if (!await _context.Authors.AnyAsync(a => a.AuthorId == book.AuthorId))
            {
                return BadRequest($"Author with ID {book.AuthorId} does not exist.");
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooks), new { id = book.BookId }, book);
        }

        // PUT: api/library/books/{id}
        [HttpPut("books/{id}")]
        public async Task<ActionResult> PutBook(int id, [FromBody] Book updatedBook)
        {
            if (updatedBook == null)
            {
                return BadRequest("Book cannot be null.");
            }

            var existingBook = await _context.Books.FindAsync(id);
            if (existingBook == null)
            {
                return NotFound();
            }

            existingBook.Title = updatedBook.Title;
            existingBook.AuthorId = updatedBook.AuthorId;
            existingBook.Genre = updatedBook.Genre;
            existingBook.PublishedDate = updatedBook.PublishedDate;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/library/books/{id}
        [HttpDelete("books/{id}")]
        public async Task<ActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/library/loans
        [HttpGet("loans")]
        public async Task<ActionResult<IEnumerable<Loan>>> GetLoans()
        {
            return await _context.Loans.ToListAsync();
        }

        // POST: api/library/loans
        [HttpPost("loans")]
        public async Task<ActionResult<Loan>> PostLoan([FromBody] Loan loan)
        {
            if (loan == null)
            {
                return BadRequest("Loan cannot be null.");
            }

            // Перевірка наявності книги та позичальника
            if (!await _context.Books.AnyAsync(b => b.BookId == loan.BookId))
            {
                return BadRequest($"Book with ID {loan.BookId} does not exist.");
            }

            if (!await _context.Borrowers.AnyAsync(b => b.BorrowerId == loan.BorrowerId))
            {
                return BadRequest($"Borrower with ID {loan.BorrowerId} does not exist.");
            }

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLoans), new { id = loan.LoanId }, loan);
        }

        // PUT: api/library/loans/{id}
        [HttpPut("loans/{id}")]
        public async Task<ActionResult> UpdateLoan(int id, [FromBody] Loan updatedLoan)
        {
            if (updatedLoan == null)
            {
                return BadRequest("Loan cannot be null.");
            }

            var existingLoan = await _context.Loans.FindAsync(id);
            if (existingLoan == null)
            {
                return NotFound();
            }

            existingLoan.BookId = updatedLoan.BookId;
            existingLoan.BorrowerId = updatedLoan.BorrowerId;
            existingLoan.LoanDate = updatedLoan.LoanDate;
            existingLoan.ReturnDate = updatedLoan.ReturnDate;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/library/loans/{id}
        [HttpDelete("loans/{id}")]
        public async Task<ActionResult> DeleteLoan(int id)
        {
            var loan = await _context.Loans.FindAsync(id);
            if (loan == null)
            {
                return NotFound();
            }

            _context.Loans.Remove(loan);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

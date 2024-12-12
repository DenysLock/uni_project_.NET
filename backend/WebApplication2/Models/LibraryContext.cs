using Microsoft.EntityFrameworkCore;
using WebApplication2.Models;

namespace WebApplication2.Models
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options) : base(options) { }

        public DbSet<Borrower> Borrowers { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Loan> Loans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Налаштування моделей ( покищо не використовується )
        }
    }
}

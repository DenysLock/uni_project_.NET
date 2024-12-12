namespace WebApplication2.Models
{
    public class Loan
    {
        public int LoanId { get; set; }
        public int BookId { get; set; }
        public int BorrowerId { get; set; }
        public DateTime LoanDate { get; set; }
        public DateTime? ReturnDate { get; set; } // Nullable для возврата
    }
}

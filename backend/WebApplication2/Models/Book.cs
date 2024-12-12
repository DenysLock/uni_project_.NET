using System.ComponentModel.DataAnnotations;

namespace WebApplication2.Models
{
    public class Book
    {
        public int BookId { get; set; }

        [Required(ErrorMessage = "Ім'я є обов'язковим.")]
        [StringLength(50, ErrorMessage = "Ім'я не повинно перевищувати 50 символів.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Автор є обов'язковим.")]
        public int AuthorId { get; set; }

        [Required(ErrorMessage = "Жанр є обов'язковим.")]
        public string Genre { get; set; }
        public DateTime? PublishedDate { get; set; }
    }
}

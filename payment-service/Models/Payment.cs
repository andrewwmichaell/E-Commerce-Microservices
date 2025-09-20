using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        public long UserId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // PENDING, COMPLETED, FAILED, REFUNDED
        
        [Required]
        public DateTime PaymentDate { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        [StringLength(100)]
        public string? PaymentMethod { get; set; }
        
        [StringLength(500)]
        public string? TransactionId { get; set; }
        
        [StringLength(1000)]
        public string? Notes { get; set; }
    }
}

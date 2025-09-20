using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PaymentDbContext _context;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(PaymentDbContext context, ILogger<PaymentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request)
        {
            try
            {
                // Simulate payment processing
                var payment = new Payment
                {
                    OrderId = request.OrderId,
                    UserId = request.UserId,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    TransactionId = GenerateTransactionId(),
                    Status = "PENDING"
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Simulate payment gateway processing
                await Task.Delay(2000); // Simulate processing time

                // For demo purposes, randomly succeed or fail
                var random = new Random();
                payment.Status = random.Next(0, 10) < 8 ? "COMPLETED" : "FAILED"; // 80% success rate
                
                if (payment.Status == "FAILED")
                {
                    payment.Notes = "Payment failed due to insufficient funds or invalid card details";
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} processed with status {Status}", 
                    payment.PaymentId, payment.Status);

                return payment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for order {OrderId}", request.OrderId);
                throw;
            }
        }

        public async Task<Payment?> GetPaymentByIdAsync(int paymentId)
        {
            return await _context.Payments.FindAsync(paymentId);
        }

        public async Task<List<Payment>> GetPaymentsByOrderIdAsync(int orderId)
        {
            return await _context.Payments
                .Where(p => p.OrderId == orderId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<List<Payment>> GetPaymentsByUserIdAsync(long userId)
        {
            return await _context.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<Payment> UpdatePaymentStatusAsync(int paymentId, string status)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                throw new ArgumentException("Payment not found");

            payment.Status = status;
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task<bool> RefundPaymentAsync(int paymentId)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(paymentId);
                if (payment == null || payment.Status != "COMPLETED")
                    return false;

                payment.Status = "REFUNDED";
                payment.Notes = $"Refunded on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}";
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refunding payment {PaymentId}", paymentId);
                return false;
            }
        }

        private string GenerateTransactionId()
        {
            return $"TXN_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}

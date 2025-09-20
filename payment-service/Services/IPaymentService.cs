using PaymentService.Models;

namespace PaymentService.Services
{
    public interface IPaymentService
    {
        Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request);
        Task<Payment?> GetPaymentByIdAsync(int paymentId);
        Task<List<Payment>> GetPaymentsByOrderIdAsync(int orderId);
        Task<List<Payment>> GetPaymentsByUserIdAsync(long userId);
        Task<Payment> UpdatePaymentStatusAsync(int paymentId, string status);
        Task<bool> RefundPaymentAsync(int paymentId);
    }
}

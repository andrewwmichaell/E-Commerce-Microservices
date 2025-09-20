using Microsoft.AspNetCore.Mvc;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost("process")]
        public async Task<ActionResult<Payment>> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            try
            {
                var payment = await _paymentService.ProcessPaymentAsync(request);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{paymentId}")]
        public async Task<ActionResult<Payment>> GetPayment(int paymentId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(paymentId);
                if (payment == null)
                    return NotFound();

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment {PaymentId}", paymentId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<List<Payment>>> GetPaymentsByOrder(int orderId)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByOrderIdAsync(orderId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments for order {OrderId}", orderId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Payment>>> GetPaymentsByUser(long userId)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByUserIdAsync(userId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{paymentId}/status")]
        public async Task<ActionResult<Payment>> UpdatePaymentStatus(int paymentId, [FromBody] string status)
        {
            try
            {
                var payment = await _paymentService.UpdatePaymentStatusAsync(paymentId, status);
                return Ok(payment);
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment status");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{paymentId}/refund")]
        public async Task<ActionResult> RefundPayment(int paymentId)
        {
            try
            {
                var success = await _paymentService.RefundPaymentAsync(paymentId);
                if (success)
                    return Ok();
                return BadRequest("Payment cannot be refunded");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refunding payment {PaymentId}", paymentId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}

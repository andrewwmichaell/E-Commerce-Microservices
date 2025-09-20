using CartService.Models;
using CartService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CartService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<List<CartItem>>> GetCartItems(long userId)
        {
            try
            {
                var cartItems = await _cartService.GetCartItemsAsync(userId);
                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart items for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("add")]
        public async Task<ActionResult<CartItem>> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                var cartItem = await _cartService.AddToCartAsync(request);
                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{userId}/items/{cartItemId}/quantity")]
        public async Task<ActionResult> UpdateQuantity(long userId, string cartItemId, [FromBody] int quantity)
        {
            try
            {
                var success = await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, quantity);
                if (success)
                    return Ok();
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item quantity");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{userId}/items/{cartItemId}")]
        public async Task<ActionResult> RemoveFromCart(long userId, string cartItemId)
        {
            try
            {
                var success = await _cartService.RemoveFromCartAsync(userId, cartItemId);
                if (success)
                    return Ok();
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{userId}")]
        public async Task<ActionResult> ClearCart(long userId)
        {
            try
            {
                var success = await _cartService.ClearCartAsync(userId);
                if (success)
                    return Ok();
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{userId}/extend-expiry")]
        public async Task<ActionResult> ExtendExpiry(long userId, [FromBody] int days = 7)
        {
            try
            {
                var success = await _cartService.ExtendCartExpiryAsync(userId, days);
                if (success)
                    return Ok();
                return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extending cart expiry");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{userId}/make-permanent")]
        public async Task<ActionResult> MakePermanent(long userId)
        {
            try
            {
                var success = await _cartService.MakeCartPermanentAsync(userId);
                if (success)
                    return Ok();
                return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error making cart permanent");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("cleanup")]
        public async Task<ActionResult> CleanupExpiredItems()
        {
            try
            {
                var success = await _cartService.CleanExpiredItemsAsync();
                if (success)
                    return Ok();
                return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired items");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}

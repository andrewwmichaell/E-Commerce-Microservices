using CartService.Models;
using StackExchange.Redis;
using System.Text.Json;

namespace CartService.Services
{
    public class CartService : ICartService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _database;
        private readonly ILogger<CartService> _logger;

        public CartService(IConnectionMultiplexer redis, ILogger<CartService> logger)
        {
            _redis = redis;
            _database = redis.GetDatabase();
            _logger = logger;
        }

        public async Task<List<CartItem>> GetCartItemsAsync(long userId)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                var cartItems = new List<CartItem>();

                var hashFields = await _database.HashGetAllAsync(cartKey);
                foreach (var field in hashFields)
                {
                    var cartItem = JsonSerializer.Deserialize<CartItem>(field.Value!);
                    if (cartItem != null)
                    {
                        // Check if item has expired
                        if (cartItem.ExpiryTime.HasValue && cartItem.ExpiryTime.Value < DateTime.UtcNow)
                        {
                            await _database.HashDeleteAsync(cartKey, field.Name);
                            continue;
                        }
                        cartItems.Add(cartItem);
                    }
                }

                return cartItems;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart items for user {UserId}", userId);
                return new List<CartItem>();
            }
        }

        public async Task<CartItem> AddToCartAsync(AddToCartRequest request)
        {
            try
            {
                var cartKey = $"cart:{request.UserId}";
                var cartItemId = $"{request.UserId}:{request.ProductId}";

                var existingItem = await _database.HashGetAsync(cartKey, cartItemId);
                CartItem cartItem;

                if (existingItem.HasValue)
                {
                    cartItem = JsonSerializer.Deserialize<CartItem>(existingItem!)!;
                    cartItem.Quantity += request.Quantity;
                }
                else
                {
                    cartItem = new CartItem
                    {
                        CartItemId = cartItemId,
                        UserId = request.UserId,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity,
                        Price = request.Price,
                        Name = request.Name,
                        ImageUrl = request.ImageUrl,
                        ExpiryTime = DateTime.UtcNow.AddHours(24) // Default 24 hours TTL
                    };
                }

                var serializedItem = JsonSerializer.Serialize(cartItem);
                await _database.HashSetAsync(cartKey, cartItemId, serializedItem);

                // Set expiry for the entire cart (24 hours)
                await _database.KeyExpireAsync(cartKey, TimeSpan.FromHours(24));

                return cartItem;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart for user {UserId}", request.UserId);
                throw;
            }
        }

        public async Task<bool> UpdateCartItemQuantityAsync(long userId, string cartItemId, int quantity)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                var existingItem = await _database.HashGetAsync(cartKey, cartItemId);

                if (!existingItem.HasValue)
                    return false;

                var cartItem = JsonSerializer.Deserialize<CartItem>(existingItem!)!;
                cartItem.Quantity = quantity;

                var serializedItem = JsonSerializer.Serialize(cartItem);
                await _database.HashSetAsync(cartKey, cartItemId, serializedItem);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item quantity for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> RemoveFromCartAsync(long userId, string cartItemId)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                return await _database.HashDeleteAsync(cartKey, cartItemId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ClearCartAsync(long userId)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                return await _database.KeyDeleteAsync(cartKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ExtendCartExpiryAsync(long userId, int days = 7)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                var cartItems = await GetCartItemsAsync(userId);

                foreach (var item in cartItems)
                {
                    item.ExpiryTime = DateTime.UtcNow.AddDays(days);
                    var serializedItem = JsonSerializer.Serialize(item);
                    await _database.HashSetAsync(cartKey, item.CartItemId, serializedItem);
                }

                // Extend the cart key expiry as well
                await _database.KeyExpireAsync(cartKey, TimeSpan.FromDays(days));

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extending cart expiry for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> MakeCartPermanentAsync(long userId)
        {
            try
            {
                var cartKey = $"cart:{userId}";
                var cartItems = await GetCartItemsAsync(userId);

                foreach (var item in cartItems)
                {
                    item.ExpiryTime = null; // Remove expiry (permanent)
                    var serializedItem = JsonSerializer.Serialize(item);
                    await _database.HashSetAsync(cartKey, item.CartItemId, serializedItem);
                }

                // Remove expiry from the cart key
                await _database.KeyPersistAsync(cartKey);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error making cart permanent for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> CleanExpiredItemsAsync()
        {
            try
            {
                var server = _redis.GetServer(_redis.GetEndPoints().First());
                var keys = server.Keys(pattern: "cart:*");

                foreach (var key in keys)
                {
                    var cartItems = await _database.HashGetAllAsync(key);
                    foreach (var field in cartItems)
                    {
                        var cartItem = JsonSerializer.Deserialize<CartItem>(field.Value!);
                        if (cartItem != null && cartItem.ExpiryTime.HasValue && cartItem.ExpiryTime.Value < DateTime.UtcNow)
                        {
                            await _database.HashDeleteAsync(key, field.Name);
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning expired cart items");
                return false;
            }
        }
    }
}

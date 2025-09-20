using CartService.Models;

namespace CartService.Services
{
    public interface ICartService
    {
        Task<List<CartItem>> GetCartItemsAsync(long userId);
        Task<CartItem> AddToCartAsync(AddToCartRequest request);
        Task<bool> UpdateCartItemQuantityAsync(long userId, string cartItemId, int quantity);
        Task<bool> RemoveFromCartAsync(long userId, string cartItemId);
        Task<bool> ClearCartAsync(long userId);
        Task<bool> ExtendCartExpiryAsync(long userId, int days = 7);
        Task<bool> MakeCartPermanentAsync(long userId);
        Task<bool> CleanExpiredItemsAsync();
    }
}

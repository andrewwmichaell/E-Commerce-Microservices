using System.Text.Json.Serialization;

namespace CartService.Models
{
    public class CartItem
    {
        [JsonPropertyName("cartItemId")]
        public string CartItemId { get; set; } = string.Empty;

        [JsonPropertyName("userId")]
        public long UserId { get; set; }

        [JsonPropertyName("productId")]
        public long ProductId { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("expiryTime")]
        public DateTime? ExpiryTime { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("imageUrl")]
        public string? ImageUrl { get; set; }
    }
}

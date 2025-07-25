using EthioMarket.Core.Entities;

namespace EthioMarket.Core.Interfaces.Repositories;

public interface IFavoriteRepository
{
    Task<Favorite?> GetAsync(string userId, int listingId);
    Task<IEnumerable<Favorite>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20);
    Task<Favorite> CreateAsync(Favorite favorite);
    Task<bool> DeleteAsync(string userId, int listingId);
    Task<bool> ExistsAsync(string userId, int listingId);
    Task<int> GetCountByListingAsync(int listingId);
    Task<int> GetCountByUserAsync(string userId);
}
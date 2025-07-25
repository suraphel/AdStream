using EthioMarket.Core.Entities;
using EthioMarket.Core.Enums;

namespace EthioMarket.Core.Interfaces.Repositories;

public interface IListingRepository
{
    Task<Listing?> GetByIdAsync(int id, bool includeInactive = false);
    Task<Listing?> GetByIdWithDetailsAsync(int id, bool includeInactive = false);
    Task<IEnumerable<Listing>> GetAllAsync(
        int page = 1, 
        int pageSize = 20, 
        string? search = null,
        int? categoryId = null,
        string? location = null,
        string? userId = null,
        ListingStatus? status = null,
        bool? isFeatured = null);
    Task<IEnumerable<Listing>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20);
    Task<IEnumerable<Listing>> GetByCategoryIdAsync(int categoryId, int page = 1, int pageSize = 20);
    Task<IEnumerable<Listing>> GetFeaturedAsync(int count = 10);
    Task<IEnumerable<Listing>> GetRecentAsync(int count = 10);
    Task<Listing> CreateAsync(Listing listing);
    Task<Listing> UpdateAsync(Listing listing);
    Task<bool> DeleteAsync(int id);
    Task<bool> IncrementViewCountAsync(int id);
    Task<int> GetTotalCountAsync();
    Task<int> GetCountByUserAsync(string userId);
    Task<int> GetCountByCategoryAsync(int categoryId);
}
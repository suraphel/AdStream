using Microsoft.EntityFrameworkCore;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Infrastructure.Data;

namespace EthioMarket.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly EthioMarketContext _context;

    public FavoriteRepository(EthioMarketContext context)
    {
        _context = context;
    }

    public async Task<Favorite?> GetAsync(string userId, int listingId)
    {
        return await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.ListingId == listingId);
    }

    public async Task<IEnumerable<Favorite>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20)
    {
        return await _context.Favorites
            .Include(f => f.Listing)
                .ThenInclude(l => l.Category)
            .Include(f => f.Listing)
                .ThenInclude(l => l.User)
            .Include(f => f.Listing)
                .ThenInclude(l => l.Images.OrderBy(i => i.SortOrder))
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Favorite> CreateAsync(Favorite favorite)
    {
        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();
        return favorite;
    }

    public async Task<bool> DeleteAsync(string userId, int listingId)
    {
        var favorite = await GetAsync(userId, listingId);
        if (favorite == null) return false;

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(string userId, int listingId)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.ListingId == listingId);
    }

    public async Task<int> GetCountByListingAsync(int listingId)
    {
        return await _context.Favorites
            .Where(f => f.ListingId == listingId)
            .CountAsync();
    }

    public async Task<int> GetCountByUserAsync(string userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .CountAsync();
    }
}
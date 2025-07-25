using Microsoft.EntityFrameworkCore;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Core.Enums;
using EthioMarket.Infrastructure.Data;

namespace EthioMarket.Infrastructure.Repositories;

public class ListingRepository : IListingRepository
{
    private readonly EthioMarketContext _context;

    public ListingRepository(EthioMarketContext context)
    {
        _context = context;
    }

    public async Task<Listing?> GetByIdAsync(int id, bool includeInactive = false)
    {
        var query = _context.Listings.AsQueryable();
        
        if (!includeInactive)
        {
            query = query.Where(l => l.Status == ListingStatus.Active);
        }

        return await query.FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<Listing?> GetByIdWithDetailsAsync(int id, bool includeInactive = false)
    {
        var query = _context.Listings
            .Include(l => l.User)
            .Include(l => l.Category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .AsQueryable();
        
        if (!includeInactive)
        {
            query = query.Where(l => l.Status == ListingStatus.Active);
        }

        return await query.FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<Listing>> GetAllAsync(
        int page = 1, 
        int pageSize = 20, 
        string? search = null,
        int? categoryId = null,
        string? location = null,
        string? userId = null,
        ListingStatus? status = null,
        bool? isFeatured = null)
    {
        var query = _context.Listings
            .Include(l => l.User)
            .Include(l => l.Category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(l => 
                l.Title.Contains(search) || 
                l.TitleAm.Contains(search) ||
                l.Description.Contains(search) ||
                l.DescriptionAm.Contains(search));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(l => l.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(l => 
                l.Location.Contains(location) || 
                l.LocationAm.Contains(location));
        }

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(l => l.UserId == userId);
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }
        else
        {
            query = query.Where(l => l.Status == ListingStatus.Active);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(l => l.IsFeatured == isFeatured.Value);
        }

        return await query
            .OrderByDescending(l => l.IsFeatured)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20)
    {
        return await _context.Listings
            .Include(l => l.Category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetByCategoryIdAsync(int categoryId, int page = 1, int pageSize = 20)
    {
        return await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .Where(l => l.CategoryId == categoryId && l.Status == ListingStatus.Active)
            .OrderByDescending(l => l.IsFeatured)
            .ThenByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetFeaturedAsync(int count = 10)
    {
        return await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .Where(l => l.IsFeatured && l.Status == ListingStatus.Active)
            .OrderByDescending(l => l.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<Listing>> GetRecentAsync(int count = 10)
    {
        return await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Category)
            .Include(l => l.Images.OrderBy(i => i.SortOrder))
            .Where(l => l.Status == ListingStatus.Active)
            .OrderByDescending(l => l.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<Listing> CreateAsync(Listing listing)
    {
        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();
        return listing;
    }

    public async Task<Listing> UpdateAsync(Listing listing)
    {
        listing.UpdatedAt = DateTime.UtcNow;
        _context.Listings.Update(listing);
        await _context.SaveChangesAsync();
        return listing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var listing = await GetByIdAsync(id, true);
        if (listing == null) return false;

        listing.Status = ListingStatus.Deleted;
        listing.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IncrementViewCountAsync(int id)
    {
        var listing = await GetByIdAsync(id, true);
        if (listing == null) return false;

        listing.ViewCount++;
        listing.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Listings
            .Where(l => l.Status == ListingStatus.Active)
            .CountAsync();
    }

    public async Task<int> GetCountByUserAsync(string userId)
    {
        return await _context.Listings
            .Where(l => l.UserId == userId && l.Status == ListingStatus.Active)
            .CountAsync();
    }

    public async Task<int> GetCountByCategoryAsync(int categoryId)
    {
        return await _context.Listings
            .Where(l => l.CategoryId == categoryId && l.Status == ListingStatus.Active)
            .CountAsync();
    }
}
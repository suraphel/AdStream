using Microsoft.EntityFrameworkCore;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Infrastructure.Data;

namespace EthioMarket.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly EthioMarketContext _context;

    public CategoryRepository(EthioMarketContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .Include(c => c.Parent)
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Category?> GetBySlugAsync(string slug)
    {
        return await _context.Categories
            .Include(c => c.Parent)
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Slug == slug);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories
            .Include(c => c.Parent)
            .Include(c => c.Children)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetActiveAsync()
    {
        return await _context.Categories
            .Include(c => c.Parent)
            .Include(c => c.Children)
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetByParentIdAsync(int? parentId)
    {
        return await _context.Categories
            .Where(c => c.ParentId == parentId && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await GetByIdAsync(id);
        if (category == null) return false;

        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Categories.AnyAsync(c => c.Id == id);
    }

    public async Task<bool> IsSlugTakenAsync(string slug, int? excludeId = null)
    {
        var query = _context.Categories.Where(c => c.Slug == slug);
        
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<int> GetListingCountAsync(int categoryId)
    {
        return await _context.Listings
            .Where(l => l.CategoryId == categoryId && l.Status == Core.Enums.ListingStatus.Active)
            .CountAsync();
    }
}
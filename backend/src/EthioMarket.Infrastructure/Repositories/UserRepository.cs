using Microsoft.EntityFrameworkCore;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Infrastructure.Data;

namespace EthioMarket.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly EthioMarketContext _context;

    public UserRepository(EthioMarketContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var user = await GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<User>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        return await _context.Users
            .OrderBy(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id);
    }

    public async Task<bool> IsEmailTakenAsync(string email, string? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.Email == email);
        
        if (!string.IsNullOrEmpty(excludeUserId))
        {
            query = query.Where(u => u.Id != excludeUserId);
        }

        return await query.AnyAsync();
    }
}
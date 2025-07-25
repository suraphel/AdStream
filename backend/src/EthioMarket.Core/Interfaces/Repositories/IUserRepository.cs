using EthioMarket.Core.Entities;

namespace EthioMarket.Core.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<User>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<bool> ExistsAsync(string id);
    Task<bool> IsEmailTakenAsync(string email, string? excludeUserId = null);
}
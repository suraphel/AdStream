using EthioMarket.Core.Entities;

namespace EthioMarket.Core.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id);
    Task<Category?> GetBySlugAsync(string slug);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<IEnumerable<Category>> GetActiveAsync();
    Task<IEnumerable<Category>> GetByParentIdAsync(int? parentId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> IsSlugTakenAsync(string slug, int? excludeId = null);
    Task<int> GetListingCountAsync(int categoryId);
}
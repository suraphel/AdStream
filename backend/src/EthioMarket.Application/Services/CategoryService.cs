using AutoMapper;
using EthioMarket.Application.DTOs;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;

namespace EthioMarket.Application.Services;

public interface ICategoryService
{
    Task<CategoryDto?> GetByIdAsync(int id);
    Task<CategoryDto?> GetBySlugAsync(string slug);
    Task<IEnumerable<CategoryDto>> GetAllAsync();
    Task<IEnumerable<CategoryDto>> GetActiveAsync();
    Task<IEnumerable<CategoryDto>> GetCategoriesWithCountAsync();
    Task<CategoryDto> CreateAsync(CreateCategoryDto createCategoryDto);
    Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto updateCategoryDto);
    Task<bool> DeleteAsync(int id);
    Task<bool> IsSlugAvailableAsync(string slug, int? excludeId = null);
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category != null ? _mapper.Map<CategoryDto>(category) : null;
    }

    public async Task<CategoryDto?> GetBySlugAsync(string slug)
    {
        var category = await _categoryRepository.GetBySlugAsync(slug);
        return category != null ? _mapper.Map<CategoryDto>(category) : null;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<IEnumerable<CategoryDto>> GetActiveAsync()
    {
        var categories = await _categoryRepository.GetActiveAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoriesWithCountAsync()
    {
        var categories = await _categoryRepository.GetActiveAsync();
        var categoryDtos = new List<CategoryDto>();

        foreach (var category in categories)
        {
            var categoryDto = _mapper.Map<CategoryDto>(category);
            categoryDto.ListingCount = await _categoryRepository.GetListingCountAsync(category.Id);
            categoryDtos.Add(categoryDto);
        }

        return categoryDtos;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto createCategoryDto)
    {
        var category = _mapper.Map<Category>(createCategoryDto);
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;
        
        var createdCategory = await _categoryRepository.CreateAsync(category);
        return _mapper.Map<CategoryDto>(createdCategory);
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto updateCategoryDto)
    {
        var existingCategory = await _categoryRepository.GetByIdAsync(id);
        if (existingCategory == null)
            throw new ArgumentException("Category not found", nameof(id));

        _mapper.Map(updateCategoryDto, existingCategory);
        existingCategory.UpdatedAt = DateTime.UtcNow;

        var updatedCategory = await _categoryRepository.UpdateAsync(existingCategory);
        return _mapper.Map<CategoryDto>(updatedCategory);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _categoryRepository.DeleteAsync(id);
    }

    public async Task<bool> IsSlugAvailableAsync(string slug, int? excludeId = null)
    {
        return !await _categoryRepository.IsSlugTakenAsync(slug, excludeId);
    }
}
using Microsoft.AspNetCore.Mvc;
using EthioMarket.Application.Services;
using EthioMarket.Application.DTOs;
using EthioMarket.Application.DTOs.Common;

namespace EthioMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetCategories([FromQuery] bool withCount = false)
    {
        try
        {
            var categories = withCount 
                ? await _categoryService.GetCategoriesWithCountAsync()
                : await _categoryService.GetActiveAsync();

            return Ok(ApiResponse<IEnumerable<CategoryDto>>.SuccessResult(categories));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories");
            return StatusCode(500, ApiResponse<IEnumerable<CategoryDto>>.ErrorResult("Failed to fetch categories"));
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id)
    {
        try
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound(ApiResponse<CategoryDto>.ErrorResult("Category not found"));
            }

            return Ok(ApiResponse<CategoryDto>.SuccessResult(category));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching category {CategoryId}", id);
            return StatusCode(500, ApiResponse<CategoryDto>.ErrorResult("Failed to fetch category"));
        }
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug)
    {
        try
        {
            var category = await _categoryService.GetBySlugAsync(slug);
            if (category == null)
            {
                return NotFound(ApiResponse<CategoryDto>.ErrorResult("Category not found"));
            }

            return Ok(ApiResponse<CategoryDto>.SuccessResult(category));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching category by slug {Slug}", slug);
            return StatusCode(500, ApiResponse<CategoryDto>.ErrorResult("Failed to fetch category"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
    {
        try
        {
            if (!await _categoryService.IsSlugAvailableAsync(createCategoryDto.Slug))
            {
                return BadRequest(ApiResponse<CategoryDto>.ErrorResult("Slug is already taken"));
            }

            var category = await _categoryService.CreateAsync(createCategoryDto);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, 
                ApiResponse<CategoryDto>.SuccessResult(category, "Category created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, ApiResponse<CategoryDto>.ErrorResult("Failed to create category"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
    {
        try
        {
            if (!string.IsNullOrEmpty(updateCategoryDto.Slug) && 
                !await _categoryService.IsSlugAvailableAsync(updateCategoryDto.Slug, id))
            {
                return BadRequest(ApiResponse<CategoryDto>.ErrorResult("Slug is already taken"));
            }

            var category = await _categoryService.UpdateAsync(id, updateCategoryDto);
            return Ok(ApiResponse<CategoryDto>.SuccessResult(category, "Category updated successfully"));
        }
        catch (ArgumentException)
        {
            return NotFound(ApiResponse<CategoryDto>.ErrorResult("Category not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId}", id);
            return StatusCode(500, ApiResponse<CategoryDto>.ErrorResult("Failed to update category"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(int id)
    {
        try
        {
            var result = await _categoryService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Category not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "Category deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to delete category"));
        }
    }
}
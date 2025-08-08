using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenderFloatingBindingApi.Data;

namespace TenderFloatingBindingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ApplicationDbContext context, ILogger<CategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetCategories()
    {
        try
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.NameAm,
                    c.Slug,
                    c.Icon,
                    c.ParentId,
                    c.GroupName,
                    c.IsActive,
                    c.SortOrder,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<object>> GetCategory(string slug)
    {
        try
        {
            var category = await _context.Categories
                .Where(c => c.Slug == slug && c.IsActive)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.NameAm,
                    c.Slug,
                    c.Icon,
                    c.ParentId,
                    c.GroupName,
                    c.IsActive,
                    c.SortOrder,
                    c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound();

            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching category {Slug}", slug);
            return StatusCode(500, "Internal server error");
        }
    }
}
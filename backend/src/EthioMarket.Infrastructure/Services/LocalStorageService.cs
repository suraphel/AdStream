using EthioMarket.Core.Interfaces.Services;

namespace EthioMarket.Infrastructure.Services;

public class LocalStorageService : IStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalStorageService(IConfiguration configuration)
    {
        _basePath = configuration.GetValue<string>("Storage:LocalPath") ?? "uploads";
        _baseUrl = configuration.GetValue<string>("Storage:BaseUrl") ?? "/uploads";
        
        // Ensure directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? folder = null)
    {
        var sanitizedFileName = SanitizeFileName(fileName);
        var uniqueFileName = GenerateUniqueFileName(sanitizedFileName);
        
        var folderPath = string.IsNullOrEmpty(folder) ? _basePath : Path.Combine(_basePath, folder);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, uniqueFileName);
        
        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput);
        }

        // Return relative path for storage
        return string.IsNullOrEmpty(folder) ? uniqueFileName : Path.Combine(folder, uniqueFileName);
    }

    public Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    public Task<Stream?> GetFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (File.Exists(fullPath))
            {
                return Task.FromResult<Stream?>(new FileStream(fullPath, FileMode.Open, FileAccess.Read));
            }
            return Task.FromResult<Stream?>(null);
        }
        catch
        {
            return Task.FromResult<Stream?>(null);
        }
    }

    public Task<string> GetFileUrlAsync(string filePath)
    {
        // Convert backslashes to forward slashes for URLs
        var normalizedPath = filePath.Replace('\\', '/');
        var url = $"{_baseUrl.TrimEnd('/')}/{normalizedPath}";
        return Task.FromResult(url);
    }

    public Task<bool> FileExistsAsync(string filePath)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public Task<long> GetFileSizeAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            if (File.Exists(fullPath))
            {
                var fileInfo = new FileInfo(fullPath);
                return Task.FromResult(fileInfo.Length);
            }
            return Task.FromResult(0L);
        }
        catch
        {
            return Task.FromResult(0L);
        }
    }

    private string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return sanitized;
    }

    private string GenerateUniqueFileName(string fileName)
    {
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        var extension = Path.GetExtension(fileName);
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var guid = Guid.NewGuid().ToString("N")[..8];
        
        return $"{nameWithoutExtension}_{timestamp}_{guid}{extension}";
    }
}
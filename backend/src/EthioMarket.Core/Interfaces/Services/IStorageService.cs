namespace EthioMarket.Core.Interfaces.Services;

public interface IStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? folder = null);
    Task<bool> DeleteFileAsync(string filePath);
    Task<Stream?> GetFileAsync(string filePath);
    Task<string> GetFileUrlAsync(string filePath);
    Task<bool> FileExistsAsync(string filePath);
    Task<long> GetFileSizeAsync(string filePath);
}
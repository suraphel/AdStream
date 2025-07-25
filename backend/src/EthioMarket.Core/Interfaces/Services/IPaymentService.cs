namespace EthioMarket.Core.Interfaces.Services;

public class PaymentRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "ETB";
    public string UserId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class PaymentResponse
{
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? PaymentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ErrorMessage { get; set; }
}

public class PaymentStatus
{
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "ETB";
    public DateTime? CompletedAt { get; set; }
    public string? FailureReason { get; set; }
}

public interface IPaymentService
{
    Task<PaymentResponse> InitiatePaymentAsync(PaymentRequest request);
    Task<PaymentStatus> GetPaymentStatusAsync(string transactionId);
    Task<bool> VerifyPaymentAsync(string transactionId);
    Task<PaymentResponse> RefundPaymentAsync(string transactionId, decimal? amount = null);
}
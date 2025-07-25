using EthioMarket.Core.Interfaces.Services;

namespace EthioMarket.Infrastructure.Services;

public class MockPaymentService : IPaymentService
{
    private readonly Dictionary<string, PaymentStatus> _payments = new();
    private readonly Random _random = new();

    public Task<PaymentResponse> InitiatePaymentAsync(PaymentRequest request)
    {
        var transactionId = Guid.NewGuid().ToString();
        var paymentUrl = $"https://mock-telebirr.com/pay/{transactionId}";

        var status = new PaymentStatus
        {
            TransactionId = transactionId,
            Status = "pending",
            Amount = request.Amount,
            Currency = request.Currency
        };

        _payments[transactionId] = status;

        var response = new PaymentResponse
        {
            TransactionId = transactionId,
            Status = "pending",
            PaymentUrl = paymentUrl
        };

        return Task.FromResult(response);
    }

    public Task<PaymentStatus> GetPaymentStatusAsync(string transactionId)
    {
        if (_payments.TryGetValue(transactionId, out var status))
        {
            // Simulate payment processing
            if (status.Status == "pending" && _random.NextDouble() < 0.3) // 30% chance to complete
            {
                status.Status = _random.NextDouble() < 0.9 ? "completed" : "failed"; // 90% success rate
                status.CompletedAt = status.Status == "completed" ? DateTime.UtcNow : null;
                status.FailureReason = status.Status == "failed" ? "Insufficient funds" : null;
            }

            return Task.FromResult(status);
        }

        throw new ArgumentException("Payment not found", nameof(transactionId));
    }

    public async Task<bool> VerifyPaymentAsync(string transactionId)
    {
        var status = await GetPaymentStatusAsync(transactionId);
        return status.Status == "completed";
    }

    public Task<PaymentResponse> RefundPaymentAsync(string transactionId, decimal? amount = null)
    {
        if (!_payments.TryGetValue(transactionId, out var payment))
        {
            throw new ArgumentException("Payment not found", nameof(transactionId));
        }

        if (payment.Status != "completed")
        {
            throw new InvalidOperationException("Cannot refund incomplete payment");
        }

        var refundId = Guid.NewGuid().ToString();
        var refundAmount = amount ?? payment.Amount;

        var response = new PaymentResponse
        {
            TransactionId = refundId,
            Status = "refunded"
        };

        return Task.FromResult(response);
    }
}
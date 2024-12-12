using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

public class Logger
{
    private readonly string _logFilePath;
    private const int MaxRetries = 5;
    private const int DelayMilliseconds = 100;

    public Logger(string logFilePath)
    {
        _logFilePath = logFilePath;
    }

    public async Task LogEventAsync(string message)
    {
        string logEntry = $"{DateTime.UtcNow}: {message}";

        for (int attempt = 0; attempt < MaxRetries; attempt++)
        {
            try
            {
                using (var stream = new FileStream(_logFilePath, FileMode.Append, FileAccess.Write, FileShare.None, bufferSize: 4096, useAsync: true))
                {
                    byte[] info = new UTF8Encoding(true).GetBytes(logEntry + Environment.NewLine);
                    await stream.WriteAsync(info, 0, info.Length);
                }
                return;
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Logging failed: {ex.Message}");

                await Task.Delay(DelayMilliseconds);
            }
        }

        Console.WriteLine($"Failed to log after {MaxRetries} attempts.");
    }
}

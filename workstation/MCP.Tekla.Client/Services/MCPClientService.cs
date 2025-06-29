using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace MCP.Tekla.Client.Services
{
    /// <summary>
    /// MCP 客戶端服務
    /// 處理與 MCP 伺服器的通訊
    /// </summary>
    public class MCPClientService : IDisposable
    {
        private readonly ILogger<MCPClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly Timer _heartbeatTimer;
        
        private string _serverBaseUrl;
        private bool _isConnected = false;
        private DateTime? _connectedSince;
        private DateTime? _lastPing;
        private bool _disposed = false;

        public MCPClientService(
            ILogger<MCPClientService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient("MCPServer");
            
            _serverBaseUrl = _configuration["MCPServer:BaseUrl"] ?? "http://localhost:8000";
            
            // 設置心跳計時器
            _heartbeatTimer = new Timer(HeartbeatCallback, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
        }

        /// <summary>
        /// 連接狀態資訊
        /// </summary>
        public class ConnectionStatus
        {
            public bool IsConnected { get; set; }
            public string? ServerAddress { get; set; }
            public DateTime? ConnectedSince { get; set; }
            public DateTime? LastPing { get; set; }
            public string? Error { get; set; }
        }

        /// <summary>
        /// 聊天請求
        /// </summary>
        public class ChatRequest
        {
            public string Message { get; set; } = string.Empty;
            public string? Context { get; set; }
            public bool UseRAG { get; set; } = true;
            public float Temperature { get; set; } = 0.7f;
            public int MaxTokens { get; set; } = 2048;
        }

        /// <summary>
        /// 聊天回應
        /// </summary>
        public class ChatResponse
        {
            public string Response { get; set; } = string.Empty;
            public bool ContextUsed { get; set; }
            public bool RAGEnabled { get; set; }
        }

        /// <summary>
        /// Tekla 命令請求
        /// </summary>
        public class TeklaCommandRequest
        {
            public string Command { get; set; } = string.Empty;
            public Dictionary<string, object>? Parameters { get; set; }
            public string? Context { get; set; }
        }

        /// <summary>
        /// Tekla 命令回應
        /// </summary>
        public class TeklaCommandResponse
        {
            public string Command { get; set; } = string.Empty;
            public Dictionary<string, object>? Parameters { get; set; }
            public string GeneratedCode { get; set; } = string.Empty;
            public bool ContextUsed { get; set; }
        }

        /// <summary>
        /// API 回應包裝器
        /// </summary>
        public class ApiResponse<T>
        {
            public bool Success { get; set; }
            public T? Data { get; set; }
            public string Message { get; set; } = string.Empty;
            public string? Timestamp { get; set; }
        }

        /// <summary>
        /// 獲取連接狀態
        /// </summary>
        public async Task<ConnectionStatus> GetConnectionStatusAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/health");
                
                if (response.IsSuccessStatusCode)
                {
                    _isConnected = true;
                    _lastPing = DateTime.Now;
                    
                    if (_connectedSince == null)
                    {
                        _connectedSince = DateTime.Now;
                    }
                    
                    return new ConnectionStatus
                    {
                        IsConnected = true,
                        ServerAddress = _serverBaseUrl,
                        ConnectedSince = _connectedSince,
                        LastPing = _lastPing
                    };
                }
                else
                {
                    _isConnected = false;
                    _connectedSince = null;
                    
                    return new ConnectionStatus
                    {
                        IsConnected = false,
                        Error = $"HTTP {response.StatusCode}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "檢查連接狀態失敗");
                
                _isConnected = false;
                _connectedSince = null;
                
                return new ConnectionStatus
                {
                    IsConnected = false,
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// 檢查是否已連接
        /// </summary>
        public bool IsConnected => _isConnected;

        /// <summary>
        /// 發送聊天訊息
        /// </summary>
        public async Task<ApiResponse<ChatResponse>> SendChatMessageAsync(ChatRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(new
                {
                    message = request.Message,
                    context = request.Context,
                    use_rag = request.UseRAG,
                    temperature = request.Temperature,
                    max_tokens = request.MaxTokens
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("/api/chat", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var chatResponse = JsonSerializer.Deserialize<ChatResponse>(responseJson, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    return new ApiResponse<ChatResponse>
                    {
                        Success = true,
                        Data = chatResponse,
                        Message = "聊天訊息發送成功"
                    };
                }
                else
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return new ApiResponse<ChatResponse>
                    {
                        Success = false,
                        Message = $"HTTP {response.StatusCode}: {errorText}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "發送聊天訊息失敗");
                return new ApiResponse<ChatResponse>
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// 處理 Tekla 命令
        /// </summary>
        public async Task<ApiResponse<TeklaCommandResponse>> ProcessTeklaCommandAsync(TeklaCommandRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(new
                {
                    command = request.Command,
                    parameters = request.Parameters,
                    context = request.Context
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("/api/tekla/command", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var teklaResponse = JsonSerializer.Deserialize<TeklaCommandResponse>(responseJson, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    return new ApiResponse<TeklaCommandResponse>
                    {
                        Success = true,
                        Data = teklaResponse,
                        Message = "Tekla 命令處理成功"
                    };
                }
                else
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return new ApiResponse<TeklaCommandResponse>
                    {
                        Success = false,
                        Message = $"HTTP {response.StatusCode}: {errorText}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "處理 Tekla 命令失敗");
                return new ApiResponse<TeklaCommandResponse>
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// 獲取 GPU 狀態
        /// </summary>
        public async Task<ApiResponse<object>> GetGPUStatusAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/gpu/status");

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var gpuStatus = JsonSerializer.Deserialize<object>(responseJson);

                    return new ApiResponse<object>
                    {
                        Success = true,
                        Data = gpuStatus,
                        Message = "GPU 狀態獲取成功"
                    };
                }
                else
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"HTTP {response.StatusCode}: {errorText}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "獲取 GPU 狀態失敗");
                return new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// 重新連接
        /// </summary>
        public async Task ReconnectAsync()
        {
            _logger.LogInformation("嘗試重新連接到 MCP 伺服器...");
            
            _isConnected = false;
            _connectedSince = null;
            
            // 測試連接
            await GetConnectionStatusAsync();
            
            if (_isConnected)
            {
                _logger.LogInformation("✅ 重新連接成功");
            }
            else
            {
                _logger.LogWarning("❌ 重新連接失敗");
            }
        }

        /// <summary>
        /// 心跳回調
        /// </summary>
        private async void HeartbeatCallback(object? state)
        {
            try
            {
                await GetConnectionStatusAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "心跳檢查失敗");
            }
        }

        /// <summary>
        /// 釋放資源
        /// </summary>
        public void Dispose()
        {
            if (!_disposed)
            {
                _heartbeatTimer?.Dispose();
                _httpClient?.Dispose();
                _disposed = true;
            }
        }
    }
}

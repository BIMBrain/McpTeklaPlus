using System;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MCP.Tekla.Client.Services;
using MCP.Tekla.Client.UI;

namespace MCP.Tekla.Client
{
    /// <summary>
    /// MCP Tekla+ 工作站客戶端主程式
    /// </summary>
    internal static class Program
    {
        private static IHost? _host;
        private static SystemTrayService? _trayService;
        private static ILogger<Program>? _logger;

        /// <summary>
        /// 應用程式的主要進入點
        /// </summary>
        [STAThread]
        static async Task Main(string[] args)
        {
            // 設置 Windows Forms
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.SetHighDpiMode(HighDpiMode.SystemAware);

            try
            {
                // 建立主機
                _host = CreateHostBuilder(args).Build();
                
                // 啟動服務
                await _host.StartAsync();
                
                // 獲取日誌器
                _logger = _host.Services.GetRequiredService<ILogger<Program>>();
                _logger.LogInformation("🚀 MCP Tekla+ 客戶端啟動");

                // 啟動系統托盤服務
                _trayService = _host.Services.GetRequiredService<SystemTrayService>();
                _trayService.Start();

                // 設置應用程式退出事件
                Application.ApplicationExit += OnApplicationExit;
                
                // 運行消息循環
                Application.Run();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"應用程式啟動失敗:\n{ex.Message}", 
                    "MCP Tekla+ 錯誤", 
                    MessageBoxButtons.OK, 
                    MessageBoxIcon.Error
                );
            }
        }

        /// <summary>
        /// 創建主機建構器
        /// </summary>
        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseWindowsService() // 支援 Windows 服務模式
                .ConfigureServices((context, services) =>
                {
                    // 註冊核心服務
                    services.AddSingleton<SystemTrayService>();
                    services.AddSingleton<MCPClientService>();
                    services.AddSingleton<TeklaIntegrationService>();
                    services.AddSingleton<ConfigurationService>();
                    services.AddSingleton<WebUIService>();
                    
                    // 註冊 HTTP 客戶端
                    services.AddHttpClient("MCPServer", client =>
                    {
                        var serverUrl = context.Configuration["MCPServer:BaseUrl"] ?? "http://localhost:8000";
                        client.BaseAddress = new Uri(serverUrl);
                        client.Timeout = TimeSpan.FromSeconds(30);
                    });
                    
                    // 註冊背景服務
                    services.AddHostedService<MCPClientBackgroundService>();
                    services.AddHostedService<TeklaMonitoringService>();
                    
                    // 註冊日誌
                    services.AddLogging(builder =>
                    {
                        builder.AddConsole();
                        builder.AddDebug();
                        builder.AddEventLog(); // Windows 事件日誌
                    });
                });

        /// <summary>
        /// 應用程式退出事件處理
        /// </summary>
        private static async void OnApplicationExit(object? sender, EventArgs e)
        {
            try
            {
                _logger?.LogInformation("🔄 MCP Tekla+ 客戶端正在關閉...");
                
                // 停止托盤服務
                _trayService?.Stop();
                
                // 停止主機
                if (_host != null)
                {
                    await _host.StopAsync(TimeSpan.FromSeconds(5));
                    _host.Dispose();
                }
                
                _logger?.LogInformation("✅ MCP Tekla+ 客戶端已關閉");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "關閉應用程式時發生錯誤");
            }
        }
    }
}

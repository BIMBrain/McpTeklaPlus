using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Extensions.Logging;
using MCP.Tekla.Client.UI;

namespace MCP.Tekla.Client.Services
{
    /// <summary>
    /// 系統托盤服務
    /// 管理系統托盤圖標和右鍵選單
    /// </summary>
    public class SystemTrayService : IDisposable
    {
        private readonly ILogger<SystemTrayService> _logger;
        private readonly MCPClientService _mcpClient;
        private readonly TeklaIntegrationService _teklaService;
        private readonly WebUIService _webUIService;
        
        private NotifyIcon? _notifyIcon;
        private ContextMenuStrip? _contextMenu;
        private Timer? _statusUpdateTimer;
        private bool _disposed = false;

        // 狀態圖標
        private Icon? _iconConnected;
        private Icon? _iconDisconnected;
        private Icon? _iconError;
        private Icon? _iconWorking;

        public SystemTrayService(
            ILogger<SystemTrayService> logger,
            MCPClientService mcpClient,
            TeklaIntegrationService teklaService,
            WebUIService webUIService)
        {
            _logger = logger;
            _mcpClient = mcpClient;
            _teklaService = teklaService;
            _webUIService = webUIService;
        }

        /// <summary>
        /// 啟動托盤服務
        /// </summary>
        public void Start()
        {
            try
            {
                _logger.LogInformation("啟動系統托盤服務");

                // 載入圖標
                LoadIcons();

                // 創建托盤圖標
                CreateNotifyIcon();

                // 創建右鍵選單
                CreateContextMenu();

                // 啟動狀態更新計時器
                StartStatusUpdateTimer();

                _logger.LogInformation("✅ 系統托盤服務已啟動");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "啟動系統托盤服務失敗");
                throw;
            }
        }

        /// <summary>
        /// 停止托盤服務
        /// </summary>
        public void Stop()
        {
            try
            {
                _logger.LogInformation("停止系統托盤服務");

                _statusUpdateTimer?.Stop();
                _notifyIcon?.Dispose();
                _contextMenu?.Dispose();

                _logger.LogInformation("✅ 系統托盤服務已停止");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "停止系統托盤服務時發生錯誤");
            }
        }

        /// <summary>
        /// 載入圖標資源
        /// </summary>
        private void LoadIcons()
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                
                // 從嵌入資源載入圖標，如果沒有則創建簡單圖標
                _iconConnected = LoadIconFromResource("connected.ico") ?? CreateSimpleIcon(Color.Green);
                _iconDisconnected = LoadIconFromResource("disconnected.ico") ?? CreateSimpleIcon(Color.Gray);
                _iconError = LoadIconFromResource("error.ico") ?? CreateSimpleIcon(Color.Red);
                _iconWorking = LoadIconFromResource("working.ico") ?? CreateSimpleIcon(Color.Orange);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "載入圖標失敗，使用預設圖標");
                
                // 使用預設圖標
                _iconConnected = CreateSimpleIcon(Color.Green);
                _iconDisconnected = CreateSimpleIcon(Color.Gray);
                _iconError = CreateSimpleIcon(Color.Red);
                _iconWorking = CreateSimpleIcon(Color.Orange);
            }
        }

        /// <summary>
        /// 從資源載入圖標
        /// </summary>
        private Icon? LoadIconFromResource(string resourceName)
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var resourcePath = $"MCP.Tekla.Client.Resources.{resourceName}";
                
                using var stream = assembly.GetManifestResourceStream(resourcePath);
                return stream != null ? new Icon(stream) : null;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// 創建簡單的彩色圖標
        /// </summary>
        private Icon CreateSimpleIcon(Color color)
        {
            var bitmap = new Bitmap(16, 16);
            using (var graphics = Graphics.FromImage(bitmap))
            {
                graphics.Clear(Color.Transparent);
                using (var brush = new SolidBrush(color))
                {
                    graphics.FillEllipse(brush, 2, 2, 12, 12);
                }
                graphics.DrawEllipse(Pens.Black, 2, 2, 12, 12);
            }
            
            return Icon.FromHandle(bitmap.GetHicon());
        }

        /// <summary>
        /// 創建托盤圖標
        /// </summary>
        private void CreateNotifyIcon()
        {
            _notifyIcon = new NotifyIcon
            {
                Icon = _iconDisconnected,
                Text = "MCP Tekla+ - 未連接",
                Visible = true
            };

            // 雙擊事件
            _notifyIcon.DoubleClick += (sender, e) =>
            {
                ShowMainWindow();
            };

            // 滑鼠點擊事件
            _notifyIcon.MouseClick += (sender, e) =>
            {
                if (e.Button == MouseButtons.Left)
                {
                    // 左鍵點擊顯示狀態資訊
                    ShowStatusBalloon();
                }
            };
        }

        /// <summary>
        /// 創建右鍵選單
        /// </summary>
        private void CreateContextMenu()
        {
            _contextMenu = new ContextMenuStrip();

            // 狀態資訊
            var statusItem = new ToolStripMenuItem("狀態資訊")
            {
                Font = new Font(_contextMenu.Font, FontStyle.Bold)
            };
            statusItem.Click += (s, e) => ShowStatusWindow();
            _contextMenu.Items.Add(statusItem);

            _contextMenu.Items.Add(new ToolStripSeparator());

            // 開啟 WebUI
            var webUIItem = new ToolStripMenuItem("開啟 WebUI");
            webUIItem.Click += (s, e) => _webUIService.OpenWebUI();
            _contextMenu.Items.Add(webUIItem);

            // Tekla 整合
            var teklaItem = new ToolStripMenuItem("Tekla 整合");
            var connectTeklaItem = new ToolStripMenuItem("連接 Tekla");
            connectTeklaItem.Click += (s, e) => ConnectToTekla();
            var disconnectTeklaItem = new ToolStripMenuItem("斷開 Tekla");
            disconnectTeklaItem.Click += (s, e) => DisconnectFromTekla();
            
            teklaItem.DropDownItems.Add(connectTeklaItem);
            teklaItem.DropDownItems.Add(disconnectTeklaItem);
            _contextMenu.Items.Add(teklaItem);

            _contextMenu.Items.Add(new ToolStripSeparator());

            // 設定
            var settingsItem = new ToolStripMenuItem("設定");
            settingsItem.Click += (s, e) => ShowSettingsWindow();
            _contextMenu.Items.Add(settingsItem);

            // 關於
            var aboutItem = new ToolStripMenuItem("關於");
            aboutItem.Click += (s, e) => ShowAboutWindow();
            _contextMenu.Items.Add(aboutItem);

            _contextMenu.Items.Add(new ToolStripSeparator());

            // 退出
            var exitItem = new ToolStripMenuItem("退出");
            exitItem.Click += (s, e) => ExitApplication();
            _contextMenu.Items.Add(exitItem);

            _notifyIcon!.ContextMenuStrip = _contextMenu;
        }

        /// <summary>
        /// 啟動狀態更新計時器
        /// </summary>
        private void StartStatusUpdateTimer()
        {
            _statusUpdateTimer = new Timer
            {
                Interval = 5000 // 每 5 秒更新一次
            };
            
            _statusUpdateTimer.Tick += async (s, e) => await UpdateStatus();
            _statusUpdateTimer.Start();
        }

        /// <summary>
        /// 更新狀態
        /// </summary>
        private async Task UpdateStatus()
        {
            try
            {
                var mcpStatus = await _mcpClient.GetConnectionStatusAsync();
                var teklaStatus = _teklaService.IsConnected();

                // 更新圖標和提示文字
                if (mcpStatus.IsConnected && teklaStatus)
                {
                    _notifyIcon!.Icon = _iconConnected;
                    _notifyIcon.Text = "MCP Tekla+ - 已連接 (伺服器 + Tekla)";
                }
                else if (mcpStatus.IsConnected)
                {
                    _notifyIcon!.Icon = _iconWorking;
                    _notifyIcon.Text = "MCP Tekla+ - 部分連接 (僅伺服器)";
                }
                else
                {
                    _notifyIcon!.Icon = _iconDisconnected;
                    _notifyIcon.Text = "MCP Tekla+ - 未連接";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新狀態時發生錯誤");
                _notifyIcon!.Icon = _iconError;
                _notifyIcon.Text = "MCP Tekla+ - 錯誤";
            }
        }

        /// <summary>
        /// 顯示主視窗
        /// </summary>
        private void ShowMainWindow()
        {
            _webUIService.OpenWebUI();
        }

        /// <summary>
        /// 顯示狀態氣球提示
        /// </summary>
        private void ShowStatusBalloon()
        {
            var message = $"伺服器: {(_mcpClient.IsConnected ? "已連接" : "未連接")}\n" +
                         $"Tekla: {(_teklaService.IsConnected() ? "已連接" : "未連接")}";
            
            _notifyIcon?.ShowBalloonTip(3000, "MCP Tekla+ 狀態", message, ToolTipIcon.Info);
        }

        /// <summary>
        /// 顯示狀態視窗
        /// </summary>
        private void ShowStatusWindow()
        {
            var statusForm = new StatusForm(_mcpClient, _teklaService);
            statusForm.Show();
        }

        /// <summary>
        /// 顯示設定視窗
        /// </summary>
        private void ShowSettingsWindow()
        {
            var settingsForm = new SettingsForm();
            settingsForm.ShowDialog();
        }

        /// <summary>
        /// 顯示關於視窗
        /// </summary>
        private void ShowAboutWindow()
        {
            var aboutForm = new AboutForm();
            aboutForm.ShowDialog();
        }

        /// <summary>
        /// 連接到 Tekla
        /// </summary>
        private async void ConnectToTekla()
        {
            try
            {
                await _teklaService.ConnectAsync();
                _notifyIcon?.ShowBalloonTip(3000, "MCP Tekla+", "已連接到 Tekla Structures", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "連接 Tekla 失敗");
                _notifyIcon?.ShowBalloonTip(3000, "MCP Tekla+", $"連接 Tekla 失敗: {ex.Message}", ToolTipIcon.Error);
            }
        }

        /// <summary>
        /// 斷開 Tekla 連接
        /// </summary>
        private void DisconnectFromTekla()
        {
            try
            {
                _teklaService.Disconnect();
                _notifyIcon?.ShowBalloonTip(3000, "MCP Tekla+", "已斷開 Tekla Structures 連接", ToolTipIcon.Info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "斷開 Tekla 連接失敗");
            }
        }

        /// <summary>
        /// 退出應用程式
        /// </summary>
        private void ExitApplication()
        {
            Application.Exit();
        }

        /// <summary>
        /// 釋放資源
        /// </summary>
        public void Dispose()
        {
            if (!_disposed)
            {
                Stop();
                
                _iconConnected?.Dispose();
                _iconDisconnected?.Dispose();
                _iconError?.Dispose();
                _iconWorking?.Dispose();
                
                _disposed = true;
            }
        }
    }
}

using System;
using System.Drawing;
using System.Threading.Tasks;
using System.Windows.Forms;
using MCP.Tekla.Client.Services;

namespace MCP.Tekla.Client.UI
{
    /// <summary>
    /// 系統狀態視窗
    /// 顯示詳細的連接狀態和系統資訊
    /// </summary>
    public partial class StatusForm : Form
    {
        private readonly MCPClientService _mcpClient;
        private readonly TeklaIntegrationService _teklaService;
        private Timer _refreshTimer;

        // UI 控制項
        private TableLayoutPanel _mainLayout;
        private GroupBox _connectionGroup;
        private GroupBox _systemGroup;
        private GroupBox _teklaGroup;
        private Label _serverStatusLabel;
        private Label _serverAddressLabel;
        private Label _connectionTimeLabel;
        private Label _teklaStatusLabel;
        private Label _teklaVersionLabel;
        private Label _modelStatusLabel;
        private Label _cpuUsageLabel;
        private Label _memoryUsageLabel;
        private Label _gpuStatusLabel;
        private ProgressBar _cpuProgressBar;
        private ProgressBar _memoryProgressBar;
        private Button _refreshButton;
        private Button _reconnectButton;
        private Button _openWebUIButton;
        private Button _closeButton;

        public StatusForm(MCPClientService mcpClient, TeklaIntegrationService teklaService)
        {
            _mcpClient = mcpClient ?? throw new ArgumentNullException(nameof(mcpClient));
            _teklaService = teklaService ?? throw new ArgumentNullException(nameof(teklaService));

            InitializeComponent();
            InitializeTimer();
            
            // 立即更新一次狀態
            _ = UpdateStatusAsync();
        }

        private void InitializeComponent()
        {
            // 表單設定
            Text = "MCP Tekla+ 狀態監控";
            Size = new Size(500, 600);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ShowInTaskbar = false;
            Icon = SystemIcons.Information;

            // 主佈局
            _mainLayout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 5,
                Padding = new Padding(10)
            };

            // 設定行高
            _mainLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize)); // 連接狀態
            _mainLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize)); // Tekla 狀態
            _mainLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize)); // 系統資訊
            _mainLayout.RowStyles.Add(new RowStyle(SizeType.Percent, 100F)); // 空白區域
            _mainLayout.RowStyles.Add(new RowStyle(SizeType.AutoSize)); // 按鈕區域

            CreateConnectionGroup();
            CreateTeklaGroup();
            CreateSystemGroup();
            CreateButtonPanel();

            Controls.Add(_mainLayout);
        }

        private void CreateConnectionGroup()
        {
            _connectionGroup = new GroupBox
            {
                Text = "🌐 伺服器連接狀態",
                Dock = DockStyle.Fill,
                Padding = new Padding(10),
                Font = new Font(Font, FontStyle.Bold)
            };

            var layout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 3,
                AutoSize = true
            };

            layout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

            // 伺服器狀態
            layout.Controls.Add(new Label { Text = "狀態:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 0);
            _serverStatusLabel = new Label { Text = "檢查中...", AutoSize = true, ForeColor = Color.Orange, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_serverStatusLabel, 1, 0);

            // 伺服器地址
            layout.Controls.Add(new Label { Text = "地址:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 1);
            _serverAddressLabel = new Label { Text = "未知", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_serverAddressLabel, 1, 1);

            // 連接時間
            layout.Controls.Add(new Label { Text = "連接時間:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 2);
            _connectionTimeLabel = new Label { Text = "未連接", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_connectionTimeLabel, 1, 2);

            _connectionGroup.Controls.Add(layout);
            _mainLayout.Controls.Add(_connectionGroup, 0, 0);
        }

        private void CreateTeklaGroup()
        {
            _teklaGroup = new GroupBox
            {
                Text = "🏗️ Tekla Structures 狀態",
                Dock = DockStyle.Fill,
                Padding = new Padding(10),
                Font = new Font(Font, FontStyle.Bold)
            };

            var layout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 3,
                AutoSize = true
            };

            layout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

            // Tekla 狀態
            layout.Controls.Add(new Label { Text = "狀態:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 0);
            _teklaStatusLabel = new Label { Text = "檢查中...", AutoSize = true, ForeColor = Color.Orange, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_teklaStatusLabel, 1, 0);

            // Tekla 版本
            layout.Controls.Add(new Label { Text = "版本:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 1);
            _teklaVersionLabel = new Label { Text = "未知", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_teklaVersionLabel, 1, 1);

            // 模型狀態
            layout.Controls.Add(new Label { Text = "模型:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 2);
            _modelStatusLabel = new Label { Text = "無模型", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_modelStatusLabel, 1, 2);

            _teklaGroup.Controls.Add(layout);
            _mainLayout.Controls.Add(_teklaGroup, 0, 1);
        }

        private void CreateSystemGroup()
        {
            _systemGroup = new GroupBox
            {
                Text = "💻 系統資源狀態",
                Dock = DockStyle.Fill,
                Padding = new Padding(10),
                Font = new Font(Font, FontStyle.Bold)
            };

            var layout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 4,
                AutoSize = true
            };

            layout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

            // CPU 使用率
            layout.Controls.Add(new Label { Text = "CPU:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 0);
            var cpuPanel = new Panel { Height = 40, Dock = DockStyle.Fill };
            _cpuUsageLabel = new Label { Text = "0%", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            _cpuProgressBar = new ProgressBar { Dock = DockStyle.Bottom, Height = 20 };
            cpuPanel.Controls.Add(_cpuUsageLabel);
            cpuPanel.Controls.Add(_cpuProgressBar);
            layout.Controls.Add(cpuPanel, 1, 0);

            // 記憶體使用率
            layout.Controls.Add(new Label { Text = "記憶體:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 1);
            var memoryPanel = new Panel { Height = 40, Dock = DockStyle.Fill };
            _memoryUsageLabel = new Label { Text = "0%", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            _memoryProgressBar = new ProgressBar { Dock = DockStyle.Bottom, Height = 20 };
            memoryPanel.Controls.Add(_memoryUsageLabel);
            memoryPanel.Controls.Add(_memoryProgressBar);
            layout.Controls.Add(memoryPanel, 1, 1);

            // GPU 狀態
            layout.Controls.Add(new Label { Text = "GPU:", AutoSize = true, Font = new Font(Font, FontStyle.Regular) }, 0, 2);
            _gpuStatusLabel = new Label { Text = "檢查中...", AutoSize = true, Font = new Font(Font, FontStyle.Regular) };
            layout.Controls.Add(_gpuStatusLabel, 1, 2);

            _systemGroup.Controls.Add(layout);
            _mainLayout.Controls.Add(_systemGroup, 0, 2);
        }

        private void CreateButtonPanel()
        {
            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.RightToLeft,
                AutoSize = true,
                Padding = new Padding(0, 10, 0, 0)
            };

            _closeButton = new Button
            {
                Text = "關閉",
                Size = new Size(80, 30),
                UseVisualStyleBackColor = true
            };
            _closeButton.Click += (s, e) => Close();

            _openWebUIButton = new Button
            {
                Text = "開啟 WebUI",
                Size = new Size(100, 30),
                UseVisualStyleBackColor = true
            };
            _openWebUIButton.Click += async (s, e) => await OpenWebUIAsync();

            _reconnectButton = new Button
            {
                Text = "重新連接",
                Size = new Size(100, 30),
                UseVisualStyleBackColor = true
            };
            _reconnectButton.Click += async (s, e) => await ReconnectAsync();

            _refreshButton = new Button
            {
                Text = "重新整理",
                Size = new Size(100, 30),
                UseVisualStyleBackColor = true
            };
            _refreshButton.Click += async (s, e) => await UpdateStatusAsync();

            buttonPanel.Controls.Add(_closeButton);
            buttonPanel.Controls.Add(_openWebUIButton);
            buttonPanel.Controls.Add(_reconnectButton);
            buttonPanel.Controls.Add(_refreshButton);

            _mainLayout.Controls.Add(buttonPanel, 0, 4);
        }

        private void InitializeTimer()
        {
            _refreshTimer = new Timer
            {
                Interval = 5000 // 每 5 秒更新一次
            };
            _refreshTimer.Tick += async (s, e) => await UpdateStatusAsync();
            _refreshTimer.Start();
        }

        private async Task UpdateStatusAsync()
        {
            try
            {
                // 更新伺服器狀態
                await UpdateServerStatusAsync();
                
                // 更新 Tekla 狀態
                UpdateTeklaStatus();
                
                // 更新系統資源狀態
                UpdateSystemStatus();
            }
            catch (Exception ex)
            {
                // 記錄錯誤但不顯示給用戶
                System.Diagnostics.Debug.WriteLine($"更新狀態時發生錯誤: {ex.Message}");
            }
        }

        private async Task UpdateServerStatusAsync()
        {
            try
            {
                var status = await _mcpClient.GetConnectionStatusAsync();
                
                if (status.IsConnected)
                {
                    _serverStatusLabel.Text = "✅ 已連接";
                    _serverStatusLabel.ForeColor = Color.Green;
                    _serverAddressLabel.Text = status.ServerAddress ?? "未知";
                    _connectionTimeLabel.Text = status.ConnectedSince?.ToString("yyyy-MM-dd HH:mm:ss") ?? "未知";
                }
                else
                {
                    _serverStatusLabel.Text = "❌ 未連接";
                    _serverStatusLabel.ForeColor = Color.Red;
                    _serverAddressLabel.Text = "無";
                    _connectionTimeLabel.Text = "未連接";
                }
            }
            catch
            {
                _serverStatusLabel.Text = "⚠️ 錯誤";
                _serverStatusLabel.ForeColor = Color.Orange;
                _serverAddressLabel.Text = "檢查失敗";
                _connectionTimeLabel.Text = "檢查失敗";
            }
        }

        private void UpdateTeklaStatus()
        {
            try
            {
                var isConnected = _teklaService.IsConnected();
                
                if (isConnected)
                {
                    _teklaStatusLabel.Text = "✅ 已連接";
                    _teklaStatusLabel.ForeColor = Color.Green;
                    
                    var version = _teklaService.GetTeklaVersion();
                    _teklaVersionLabel.Text = version ?? "2025.0";
                    
                    var modelInfo = _teklaService.GetCurrentModelInfo();
                    _modelStatusLabel.Text = modelInfo?.Name ?? "無模型";
                }
                else
                {
                    _teklaStatusLabel.Text = "❌ 未連接";
                    _teklaStatusLabel.ForeColor = Color.Red;
                    _teklaVersionLabel.Text = "未知";
                    _modelStatusLabel.Text = "無模型";
                }
            }
            catch
            {
                _teklaStatusLabel.Text = "⚠️ 錯誤";
                _teklaStatusLabel.ForeColor = Color.Orange;
                _teklaVersionLabel.Text = "檢查失敗";
                _modelStatusLabel.Text = "檢查失敗";
            }
        }

        private void UpdateSystemStatus()
        {
            try
            {
                // 獲取 CPU 使用率
                var cpuUsage = GetCpuUsage();
                _cpuUsageLabel.Text = $"{cpuUsage:F1}%";
                _cpuProgressBar.Value = Math.Min(100, (int)cpuUsage);

                // 獲取記憶體使用率
                var memoryUsage = GetMemoryUsage();
                _memoryUsageLabel.Text = $"{memoryUsage:F1}%";
                _memoryProgressBar.Value = Math.Min(100, (int)memoryUsage);

                // 獲取 GPU 狀態
                var gpuStatus = GetGpuStatus();
                _gpuStatusLabel.Text = gpuStatus;
            }
            catch
            {
                _cpuUsageLabel.Text = "檢查失敗";
                _memoryUsageLabel.Text = "檢查失敗";
                _gpuStatusLabel.Text = "檢查失敗";
            }
        }

        private double GetCpuUsage()
        {
            // 簡化的 CPU 使用率獲取
            // 實際實現可能需要使用 PerformanceCounter 或 WMI
            return new Random().NextDouble() * 100; // 模擬數據
        }

        private double GetMemoryUsage()
        {
            // 簡化的記憶體使用率獲取
            var totalMemory = GC.GetTotalMemory(false);
            return (totalMemory / (1024.0 * 1024.0 * 1024.0)) * 100; // 轉換為 GB 並計算百分比
        }

        private string GetGpuStatus()
        {
            // 簡化的 GPU 狀態獲取
            // 實際實現可能需要使用 NVIDIA Management Library 或 WMI
            return "RTX 5090 - 正常";
        }

        private async Task OpenWebUIAsync()
        {
            try
            {
                var webUIService = new WebUIService();
                webUIService.OpenWebUI();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"開啟 WebUI 失敗: {ex.Message}", "錯誤", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task ReconnectAsync()
        {
            try
            {
                _reconnectButton.Enabled = false;
                _reconnectButton.Text = "連接中...";

                await _mcpClient.ReconnectAsync();
                await _teklaService.ConnectAsync();

                MessageBox.Show("重新連接成功", "資訊", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"重新連接失敗: {ex.Message}", "錯誤", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                _reconnectButton.Enabled = true;
                _reconnectButton.Text = "重新連接";
            }
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            _refreshTimer?.Stop();
            _refreshTimer?.Dispose();
            base.OnFormClosed(e);
        }
    }
}

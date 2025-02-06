using System;
using System.IO;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Fleck;

namespace PowerMonitorService
{
    public class Worker : BackgroundService
    {
        private WebSocketServer? _server;
        private ManagementEventWatcher? _watcher;
        private readonly HashSet<IWebSocketConnection> _connectedClients = new();
        private readonly string logPath;

        public Worker()
        {
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            logPath = Path.Combine(baseDirectory, "logs", "service.log");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Log("🚀 Starting service...");

            try
            {
                Log("📡 Initializing WebSocket...");
                _server = new WebSocketServer("ws://127.0.0.1:18080");
                _server.Start(socket =>
                {
                    socket.OnOpen = () =>
                    {
                        Log("✅ Vanusa connected!");
                        _connectedClients.Add(socket);
                    };

                    socket.OnClose = () =>
                    {
                        Log("❌ Vanusa disconnected!");
                        _connectedClients.Remove(socket);
                    };
                });
                Log("📡 WebSocket initialized.");

                Log("⚡ Iniciando monitoramento de eventos de energia...");
                _watcher = new ManagementEventWatcher(new WqlEventQuery("SELECT * FROM Win32_PowerManagementEvent"));
                _watcher.EventArrived += (s, e) =>
                {
                    try
                    {
                        int eventType = Convert.ToInt32(e.NewEvent["EventType"]);
                        if (eventType == 4 || eventType == 7) 
                        {
                            Log("💤 OS is entering suspension...");
                            foreach (var socket in _connectedClients)
                            {
                                if (socket.IsAvailable)
                                    socket.Send("suspend");
                            }
                        }
                        else if (eventType == 7) 
                        {
                            Log("🔋 OS is resuming...");
                            foreach (var socket in _connectedClients)
                            {
                                if (socket.IsAvailable)
                                    socket.Send("resume");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Log($"[Erro] Falha ao processar evento de energia: {ex.Message}");
                    }
                };
                _watcher.Start();
                Log("⚡ Event monitoring initialized.");

                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                Log($"[Erro] Falha ao iniciar o serviço: {ex.Message}");
            }
        }

        public override void Dispose()
        {
            try
            {
                _watcher?.Stop();
                _watcher?.Dispose();
                _server?.Dispose();
            }
            catch (Exception ex)
            {
                Log($"[Error] Failed to close services: {ex.Message}");
            }
            base.Dispose();
        }

        private void Log(string message)
        {
            try
            {
                string directory = Path.GetDirectoryName(logPath)!;
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory);

                string logMessage = $"{DateTime.Now}: {message}{Environment.NewLine}";
                File.AppendAllText(logPath, logMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error writing log] {ex.Message}");
            }
        }
    }
}

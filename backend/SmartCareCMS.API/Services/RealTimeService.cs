using System.Collections.Concurrent;
using System.Text.Json;

namespace SmartCareCMS.API.Services
{
    public interface IRealTimeService
    {
        void Subscribe(string userId, IClientProxy client);
        void Unsubscribe(string userId);
        Task BroadcastNotificationAsync(string userId, object notification);
        Task BroadcastMessageAsync(string userId, object message);
    }

    public interface IClientProxy
    {
        Task SendAsync(string method, object? arg = null);
    }

    public class RealTimeService : IRealTimeService
    {
        private static readonly ConcurrentDictionary<string, List<IClientProxy>> _subscribers = 
            new ConcurrentDictionary<string, List<IClientProxy>>();

        public void Subscribe(string userId, IClientProxy client)
        {
            if (!_subscribers.TryGetValue(userId, out var clients))
            {
                clients = new List<IClientProxy>();
                _subscribers.TryAdd(userId, clients);
            }

            lock (clients)
            {
                if (!clients.Contains(client))
                {
                    clients.Add(client);
                }
            }
        }

        public void Unsubscribe(string userId)
        {
            _subscribers.TryRemove(userId, out _);
        }

        public async Task BroadcastNotificationAsync(string userId, object notification)
        {
            if (_subscribers.TryGetValue(userId, out var clients))
            {
                var notificationJson = JsonSerializer.Serialize(notification);
                
                var clientsToRemove = new List<IClientProxy>();
                
                lock (clients)
                {
                    foreach (var client in clients.ToList())
                    {
                        try
                        {
                            await client.SendAsync("ReceiveNotification", notificationJson);
                        }
                        catch
                        {
                            // Client is no longer available, mark for removal
                            clientsToRemove.Add(client);
                        }
                    }

                    // Remove disconnected clients
                    foreach (var clientToRemove in clientsToRemove)
                    {
                        clients.Remove(clientToRemove);
                    }
                }
            }
        }

        public async Task BroadcastMessageAsync(string userId, object message)
        {
            if (_subscribers.TryGetValue(userId, out var clients))
            {
                var messageJson = JsonSerializer.Serialize(message);
                
                var clientsToRemove = new List<IClientProxy>();
                
                lock (clients)
                {
                    foreach (var client in clients.ToList())
                    {
                        try
                        {
                            await client.SendAsync("ReceiveMessage", messageJson);
                        }
                        catch
                        {
                            // Client is no longer available, mark for removal
                            clientsToRemove.Add(client);
                        }
                    }

                    // Remove disconnected clients
                    foreach (var clientToRemove in clientsToRemove)
                    {
                        clients.Remove(clientToRemove);
                    }
                }
            }
        }
    }
    
    // Simple implementation of IClientProxy for Server-Sent Events
    public class ServerSentEventsProxy : IClientProxy
    {
        private readonly HttpResponse _response;
        private readonly CancellationToken _cancellationToken;

        public ServerSentEventsProxy(HttpResponse response, CancellationToken cancellationToken)
        {
            _response = response;
            _cancellationToken = cancellationToken;
            
            // Set up response headers for SSE
            _response.Headers.Append("Content-Type", "text/event-stream");
            _response.Headers.Append("Cache-Control", "no-cache");
            _response.Headers.Append("Connection", "keep-alive");
            _response.Headers.Append("Access-Control-Allow-Origin", "*");
        }

        public async Task SendAsync(string method, object? arg = null)
        {
            if (_cancellationToken.IsCancellationRequested)
                return;

            string data = arg?.ToString() ?? "";
            
            // Format the SSE message
            string sseMessage = $"data: {data}\n\n";
            
            await _response.WriteAsync(sseMessage);
            await _response.Body.FlushAsync();
        }
    }
}
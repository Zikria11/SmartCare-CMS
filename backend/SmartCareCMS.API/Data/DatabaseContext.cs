using MongoDB.Driver;
using SmartCareCMS.API.Models;

namespace SmartCareCMS.API.Data
{
    public class DatabaseContext
    {
        private readonly IMongoDatabase _database;

        public DatabaseContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDBConnection") ?? 
                                 configuration.GetConnectionString("MONGODB_URI") ?? 
                                 Environment.GetEnvironmentVariable("MONGODB_URI") ?? 
                                 "mongodb://localhost:27017/SmartCareCMS";
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("SmartCareCMS");

            // Ensure indexes to prevent future duplicates
            try
            {
                var users = _database.GetCollection<Models.User>("users");

                // Unique partial index on email for doctor role (only applies when email exists and non-empty)
                var emailIndexKeys = Builders<Models.User>.IndexKeys.Ascending(u => u.Email);
                var emailIndexOptions = new CreateIndexOptions<Models.User>
                {
                    Unique = true,
                    PartialFilterExpression = Builders<Models.User>.Filter.And(
                        Builders<Models.User>.Filter.Eq(u => u.Role, Models.UserRole.Doctor),
                        Builders<Models.User>.Filter.Ne(u => u.Email, null),
                        Builders<Models.User>.Filter.Ne(u => u.Email, "")
                    )
                };
                users.Indexes.CreateOne(new CreateIndexModel<Models.User>(emailIndexKeys, emailIndexOptions));

                // Unique username index for all users (if username present)
                var usernameIndexKeys = Builders<Models.User>.IndexKeys.Ascending(u => u.Username);
                var usernameIndexOptions = new CreateIndexOptions<Models.User>
                {
                    Unique = true,
                    PartialFilterExpression = Builders<Models.User>.Filter.Ne(u => u.Username, "")
                };
                users.Indexes.CreateOne(new CreateIndexModel<Models.User>(usernameIndexKeys, usernameIndexOptions));
            }
            catch
            {
                // Ignore index creation failures at startup; admin can run scripts manually.
            }
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Appointment> Appointments => _database.GetCollection<Appointment>("appointments");
        public IMongoCollection<MedicalHistory> MedicalHistories => _database.GetCollection<MedicalHistory>("medicalHistories");
        public IMongoCollection<LabReport> LabReports => _database.GetCollection<LabReport>("labReports");
        public IMongoCollection<Billing> Billings => _database.GetCollection<Billing>("billings");
        public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("notifications");
        public IMongoCollection<Message> Messages => _database.GetCollection<Message>("messages");
        public IMongoCollection<Conversation> Conversations => _database.GetCollection<Conversation>("conversations");
    }
}
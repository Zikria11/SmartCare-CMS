using MongoDB.Bson;
using MongoDB.Driver;

var connectionString = args.Length > 0 ? args[0] : "mongodb://localhost:27017";
var client = new MongoClient(connectionString);
var db = client.GetDatabase("SmartCareCMS");
var users = db.GetCollection<BsonDocument>("users");

var pipeline = new BsonDocument[] {
    new BsonDocument("$match", new BsonDocument("role", 1)),
    new BsonDocument("$addFields", new BsonDocument {
        { "emailNorm", new BsonDocument("$trim", new BsonDocument("input", new BsonDocument("$toLower", "$email"))) },
        { "fullNameNorm", new BsonDocument("$trim", new BsonDocument("input", new BsonDocument("$toLower", "$fullName"))) }
    }),
    new BsonDocument("$project", new BsonDocument {
        { "key", new BsonDocument("$cond", new BsonArray { new BsonDocument("$ne", new BsonArray { "$emailNorm", "" }), "$emailNorm", "$fullNameNorm" }) },
        { "createdAt", 1 }
    }),
    new BsonDocument("$group", new BsonDocument {
        { "_id", "$key" },
        { "docs", new BsonDocument("$push", new BsonDocument { { "_id", "$_id" }, { "createdAt", "$createdAt" } }) },
        { "count", new BsonDocument("$sum", 1) }
    }),
    new BsonDocument("$match", new BsonDocument("count", new BsonDocument("$gt", 1)))
};

var groups = await users.Aggregate<BsonDocument>(pipeline).ToListAsync();

int totalRemoved = 0;

foreach (var g in groups)
{
    var docs = g["docs"].AsBsonArray.Select(d => {
        var bd = d.AsBsonDocument;
        var id = bd.GetValue("_id").AsObjectId;
        DateTime? created = null;
        if (bd.Contains("createdAt") && !bd.GetValue("createdAt").IsBsonNull)
        {
            created = bd.GetValue("createdAt").ToUniversalTime();
        }
        return new { Id = id, CreatedAt = created };
    }).ToList();

    docs.Sort((a, b) => {
        var aDate = a.CreatedAt ?? DateTime.MinValue;
        var bDate = b.CreatedAt ?? DateTime.MinValue;
        return aDate.CompareTo(bDate);
    });

    var removeIds = docs.Skip(1).Select(x => (BsonValue)x.Id).ToList();
    if (removeIds.Count > 0)
    {
        var delFilter = Builders<BsonDocument>.Filter.In("_id", removeIds);
        var res = await users.DeleteManyAsync(delFilter);
        Console.WriteLine($"Group {g["_id"]}: removed {res.DeletedCount}");
        totalRemoved += (int)res.DeletedCount;
    }
}

Console.WriteLine($"Total removed: {totalRemoved}");

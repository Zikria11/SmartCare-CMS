const coll = db.getCollection('users');

const groups = coll.aggregate([
  { $match: { role: 1 } },
  { $addFields: { emailNorm: { $trim: { input: { $toLower: "$email" } } }, fullNameNorm: { $trim: { input: { $toLower: "$fullName" } } } } },
  { $project: { key: { $cond: [ { $ne: ["$emailNorm", ""] }, "$emailNorm", "$fullNameNorm"] }, createdAt:1 } },
  { $group: { _id: "$key", docs: { $push: { _id: "$_id", createdAt: "$createdAt" } }, count: { $sum:1 } } },
  { $match: { count: { $gt:1 } } }
]).toArray();

let totalRemoved = 0;

groups.forEach(g => {
  g.docs.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const removeIds = g.docs.slice(1).map(x => x._id);
  if (removeIds.length > 0) {
    const res = coll.deleteMany({ _id: { $in: removeIds } });
    const removed = res.deletedCount || 0;
    totalRemoved += removed;
    print(`Group ${g._id}: removed ${removed}`);
  }
});

print('Total removed: ' + totalRemoved);

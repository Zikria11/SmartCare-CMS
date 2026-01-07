import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiService } from '@/services/ApiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DuplicateGroup {
  Key: string;
  Count: number;
  Docs: Array<{ Id: string; FullName: string; Email: string; Username: string; City?: string; CreatedAt?: string }>;
}

const AdminDuplicates = () => {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.getDuplicateDoctorsPreview();
        setGroups(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllDuplicates = () => {
    const map: Record<string, boolean> = {};
    groups.forEach(g => {
      // mark all except the first doc in each group
      g.Docs.slice(1).forEach(d => map[d.Id] = true);
    });
    setSelected(map);
  };

  const clearSelection = () => setSelected({});

  const deleteSelected = async () => {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) return alert('No documents selected');
    if (!confirm(`Delete ${ids.length} documents? This will archive them first.`)) return;

    setDeleting(true);
    try {
      const res = await apiService.deleteDuplicateDoctors(ids);
      alert(`Deleted: ${res?.Deleted || 0}`);
      // refresh
      const refreshed = await apiService.getDuplicateDoctorsPreview();
      setGroups(refreshed || []);
      setSelected({});
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected documents');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Duplicate Doctors</h1>
          <div className="flex gap-2">
            <Button onClick={selectAllDuplicates}>Select duplicates</Button>
            <Button variant="outline" onClick={clearSelection}>Clear</Button>
            <Button className="bg-destructive" onClick={deleteSelected} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Selected'}</Button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent>No duplicate doctors found.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <Card key={g.Key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.Key}</div>
                      <div className="text-sm text-muted-foreground">Count: {g.Count}</div>
                    </div>
                    <div className="text-sm">Select duplicates (keeps first)</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {g.Docs.map((d, idx) => (
                      <div key={d.Id} className="flex items-center justify-between p-2">
                        <div>
                          <div className="font-medium">{d.FullName} {idx === 0 && <span className="text-xs text-green-600">(kept)</span>}</div>
                          <div className="text-sm text-muted-foreground">{d.Email} • {d.Username} • {d.City}</div>
                          <div className="text-sm text-muted-foreground">Created: {d.CreatedAt}</div>
                        </div>
                        <div>
                          {idx === 0 ? null : (
                            <input type="checkbox" checked={!!selected[d.Id]} onChange={() => toggle(d.Id)} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDuplicates;

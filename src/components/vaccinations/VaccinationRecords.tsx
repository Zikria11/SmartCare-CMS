import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Syringe, 
  Calendar, 
  User, 
  Edit3, 
  Save, 
  X,
  Trash2,
  MapPin,
  FileText
} from 'lucide-react';

interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  vaccineType: string; // e.g., 'COVID-19', 'Flu', 'Hepatitis B'
  batchNumber: string;
  manufacturer: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  administeredBy: string;
  location: string;
  notes?: string;
  lotNumber: string;
  expirationDate: Date;
  doseNumber: number; // e.g., 1st dose, 2nd dose
  totalDoses: number; // total number of doses in series
  reaction?: string; // any adverse reactions
  status: 'administered' | 'scheduled' | 'missed' | 'refused';
}

interface VaccinationRecordsProps {
  patientId?: string;
  doctorId?: string;
  canEdit?: boolean;
}

const VaccinationRecords: React.FC<VaccinationRecordsProps> = ({ 
  patientId, 
  doctorId, 
  canEdit = true 
}) => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  
  const [newRecord, setNewRecord] = useState<Omit<VaccinationRecord, 'id'>>({
    patientId: patientId || '',
    vaccineName: '',
    vaccineType: '',
    batchNumber: '',
    manufacturer: '',
    dateAdministered: new Date(),
    administeredBy: doctorId ? `Dr. ${doctorId}` : '',
    location: '',
    lotNumber: '',
    expirationDate: new Date(),
    doseNumber: 1,
    totalDoses: 1,
    status: 'administered'
  });

  // Fetch vaccination records from backend
  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would make an API call to fetch vaccination records
        // const response = await api.get(`/vaccinations/patient/${patientId}`);
        // const records = response.data;
        
        // For now, we'll initialize with empty array
        setRecords([]);
      } catch (error) {
        console.error('Error fetching vaccination records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchVaccinations();
    }
  }, [patientId]);
  
  // Get unique vaccine types
  const vaccineTypes = ['all', ...new Set(records.map(r => r.vaccineType))];

  // Filter records based on search and type
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.vaccineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.vaccineType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSaveRecord = async () => {
    if (!newRecord.vaccineName || !newRecord.manufacturer) return;

    try {
      if (editingRecord) {
        // In a real app, this would make an API call to update the record
        // await api.put(`/vaccinations/${editingRecord.id}`, {
        //   ...newRecord,
        //   id: editingRecord.id
        // });
        
        // Update existing record
        setRecords(records.map(r => 
          r.id === editingRecord.id 
            ? { ...newRecord, id: editingRecord.id } 
            : r
        ));
      } else {
        // In a real app, this would make an API call to add the record
        // const response = await api.post('/vaccinations', newRecord);
        // const record: VaccinationRecord = response.data;
        
        // Add new record
        const record: VaccinationRecord = {
          ...newRecord,
          id: `vac_${Date.now()}`
        };
        setRecords([...records, record]);
      }

      // Reset form
      setNewRecord({
        patientId: patientId || '',
        vaccineName: '',
        vaccineType: '',
        batchNumber: '',
        manufacturer: '',
        dateAdministered: new Date(),
        administeredBy: doctorId ? `Dr. ${doctorId}` : '',
        location: '',
        lotNumber: '',
        expirationDate: new Date(),
        doseNumber: 1,
        totalDoses: 1,
        status: 'administered'
      });
      setEditingRecord(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving vaccination record:', error);
      alert('Error saving vaccination record');
    }
  };

  const handleEditRecord = (record: VaccinationRecord) => {
    setEditingRecord(record);
    setNewRecord({
      patientId: record.patientId,
      vaccineName: record.vaccineName,
      vaccineType: record.vaccineType,
      batchNumber: record.batchNumber,
      manufacturer: record.manufacturer,
      dateAdministered: record.dateAdministered,
      nextDueDate: record.nextDueDate,
      administeredBy: record.administeredBy,
      location: record.location,
      notes: record.notes,
      lotNumber: record.lotNumber,
      expirationDate: record.expirationDate,
      doseNumber: record.doseNumber,
      totalDoses: record.totalDoses,
      reaction: record.reaction,
      status: record.status
    });
    setShowForm(true);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      // In a real app, this would make an API call to delete the record
      // await api.delete(`/vaccinations/${id}`);
      
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      alert('Error deleting vaccination record');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'administered':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'refused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5" />
                Vaccination Records
              </CardTitle>
              <CardDescription>
                Track immunization history and schedule
              </CardDescription>
            </div>
            
            {canEdit && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vaccination
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vaccinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {vaccineTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRecord ? 'Edit Vaccination Record' : 'Add New Vaccination'}
            </CardTitle>
            <CardDescription>
              {editingRecord 
                ? 'Update the details for this vaccination' 
                : 'Add a new vaccination record'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Vaccine Name</label>
                  <Input
                    value={newRecord.vaccineName}
                    onChange={(e) => setNewRecord({...newRecord, vaccineName: e.target.value})}
                    placeholder="e.g., COVID-19 Vaccine"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Vaccine Type</label>
                  <Input
                    value={newRecord.vaccineType}
                    onChange={(e) => setNewRecord({...newRecord, vaccineType: e.target.value})}
                    placeholder="e.g., COVID-19, Flu, Hepatitis B"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Manufacturer</label>
                  <Input
                    value={newRecord.manufacturer}
                    onChange={(e) => setNewRecord({...newRecord, manufacturer: e.target.value})}
                    placeholder="e.g., Pfizer, Moderna"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Batch/Lot Number</label>
                  <Input
                    value={newRecord.lotNumber}
                    onChange={(e) => setNewRecord({...newRecord, lotNumber: e.target.value})}
                    placeholder="e.g., ABCD1234"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Dose Number</label>
                  <Input
                    type="number"
                    min="1"
                    value={newRecord.doseNumber}
                    onChange={(e) => setNewRecord({...newRecord, doseNumber: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Total Doses</label>
                  <Input
                    type="number"
                    min="1"
                    value={newRecord.totalDoses}
                    onChange={(e) => setNewRecord({...newRecord, totalDoses: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Status</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({...newRecord, status: e.target.value as any})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="administered">Administered</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="missed">Missed</option>
                    <option value="refused">Refused</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Date Administered</label>
                  <Input
                    type="date"
                    value={newRecord.dateAdministered.toISOString().split('T')[0]}
                    onChange={(e) => setNewRecord({...newRecord, dateAdministered: new Date(e.target.value)})}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Expiration Date</label>
                  <Input
                    type="date"
                    value={newRecord.expirationDate.toISOString().split('T')[0]}
                    onChange={(e) => setNewRecord({...newRecord, expirationDate: new Date(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Administered By</label>
                  <Input
                    value={newRecord.administeredBy}
                    onChange={(e) => setNewRecord({...newRecord, administeredBy: e.target.value})}
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Location</label>
                  <Input
                    value={newRecord.location}
                    onChange={(e) => setNewRecord({...newRecord, location: e.target.value})}
                    placeholder="e.g., Main Clinic"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Next Due Date (if applicable)</label>
                <Input
                  type="date"
                  value={newRecord.nextDueDate ? newRecord.nextDueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewRecord({
                    ...newRecord, 
                    nextDueDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Notes</label>
                <Input
                  value={newRecord.notes || ''}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  placeholder="Additional notes about the vaccination"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Adverse Reactions (if any)</label>
                <Input
                  value={newRecord.reaction || ''}
                  onChange={(e) => setNewRecord({...newRecord, reaction: e.target.value})}
                  placeholder="Any reactions experienced"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveRecord}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    setNewRecord({
                      patientId: patientId || '',
                      vaccineName: '',
                      vaccineType: '',
                      batchNumber: '',
                      manufacturer: '',
                      dateAdministered: new Date(),
                      administeredBy: doctorId ? `Dr. ${doctorId}` : '',
                      location: '',
                      lotNumber: '',
                      expirationDate: new Date(),
                      doseNumber: 1,
                      totalDoses: 1,
                      status: 'administered'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vaccination Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Syringe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No vaccination records found</p>
              <p className="text-sm">Try changing your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map(record => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{record.vaccineName}</h3>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{record.vaccineType}</p>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-muted-foreground" />
                        <span>Dose {record.doseNumber} of {record.totalDoses}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Administered: {formatDate(record.dateAdministered)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>By: {record.administeredBy}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{record.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>Lot: {record.lotNumber}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Expires: {formatDate(record.expirationDate)}</span>
                      </div>
                    </div>
                    
                    {record.nextDueDate && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Next due: </span>
                        <span className="font-medium">{formatDate(record.nextDueDate)}</span>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        <span>{record.notes}</span>
                      </div>
                    )}
                    
                    {record.reaction && (
                      <div className="mt-2 text-sm">
                        <span className="text-destructive">Reaction: </span>
                        <span>{record.reaction}</span>
                      </div>
                    )}
                  </div>
                  
                  {canEdit && (
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vaccination Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Summary</CardTitle>
          <CardDescription>Overview of vaccination status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">{records.length}</div>
              <div className="text-sm text-muted-foreground">Total Vaccinations</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {records.filter(r => r.status === 'administered').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {records.filter(r => r.status === 'scheduled').length}
              </div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">By Type:</h4>
            <div className="flex flex-wrap gap-2">
              {vaccineTypes.filter(t => t !== 'all').map(type => {
                const count = records.filter(r => r.vaccineType === type).length;
                return (
                  <Badge key={type} variant="secondary" className="text-sm">
                    {type}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaccinationRecords;
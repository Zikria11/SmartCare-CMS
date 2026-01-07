import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Phone, 
  Mail, 
  Home, 
  HeartPulse,
  Shield,
  User,
  Edit3,
  Save,
  AlertTriangle
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

interface InsuranceInfo {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: Date;
  expirationDate: Date;
  primaryHolder: string;
  memberId: string;
  phone: string;
  notes?: string;
}

interface EmergencyContactsProps {
  patientId?: string;
  onSave?: (contacts: EmergencyContact[], insurance: InsuranceInfo) => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ patientId, onSave }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567',
      email: 'jane@example.com',
      isPrimary: true
    },
    {
      id: '2',
      name: 'John Smith',
      relationship: 'Brother',
      phone: '+1 (555) 987-6543',
      isPrimary: false
    }
  ]);
  
  const [insurance, setInsurance] = useState<InsuranceInfo>({
    id: '1',
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'POL123456',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2025-01-01'),
    primaryHolder: 'John Doe',
    memberId: 'MEM789012',
    phone: '+1 (800) 123-4567'
  });
  
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id' | 'isPrimary'>>({ 
    name: '', 
    relationship: '', 
    phone: '', 
    email: '', 
    address: '' 
  });
  const [newInsurance, setNewInsurance] = useState<InsuranceInfo>(insurance);

  // Fetch emergency contacts and insurance from backend
  useEffect(() => {
    if (patientId) {
      const fetchEmergencyData = async () => {
        try {
          // In a real app, this would make API calls to fetch emergency contacts and insurance info
          // const contactsResponse = await api.get(`/emergency-contacts/patient/${patientId}`);
          // const contacts = contactsResponse.data;
          // 
          // const insuranceResponse = await api.get(`/insurance/patient/${patientId}`);
          // const insurance = insuranceResponse.data;
          
          // For now, we'll initialize with empty data
          setContacts([]);
          setInsurance({
            id: '',
            provider: '',
            policyNumber: '',
            effectiveDate: new Date(),
            expirationDate: new Date(),
            primaryHolder: '',
            memberId: '',
            phone: ''
          });
        } catch (error) {
          console.error('Error fetching emergency data:', error);
        }
      };
      
      fetchEmergencyData();
    }
  }, [patientId]);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    
    try {
      // In a real app, this would make an API call to add the contact
      // const response = await api.post('/emergency-contacts', {
      //   ...newContact,
      //   patientId,
      //   isPrimary: contacts.length === 0
      // });
      // 
      // const contact: EmergencyContact = response.data;
      
      // For now, we'll simulate adding the contact
      const contact: EmergencyContact = {
        id: `contact_${Date.now()}`,
        ...newContact,
        isPrimary: contacts.length === 0 // Make first contact primary
      };
      
      setContacts([...contacts, contact]);
      setNewContact({ name: '', relationship: '', phone: '', email: '', address: '' });
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error adding emergency contact');
    }
  };

  const handleRemoveContact = async (id: string) => {
    try {
      // In a real app, this would make an API call to delete the contact
      // await api.delete(`/emergency-contacts/${id}`);
      
      setContacts(contacts.filter(contact => contact.id !== id));
      if (editingContact === id) setEditingContact(null);
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Error removing emergency contact');
    }
  };

  const handleMakePrimary = (id: string) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    })));
  };

  const handleEditContact = (id: string) => {
    setEditingContact(id);
  };

  const handleSaveContact = (id: string) => {
    setEditingContact(null);
  };

  const handleUpdateContact = async (id: string, field: keyof EmergencyContact, value: string) => {
    try {
      // In a real app, this would make an API call to update the contact
      // await api.put(`/emergency-contacts/${id}`, { [field]: value });
      
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, [field]: value } : contact
      ));
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error updating emergency contact');
    }
  };

  const handleSaveInsurance = async () => {
    try {
      // In a real app, this would make an API call to save the insurance info
      // await api.put(`/insurance/${newInsurance.id}`, newInsurance);
      
      setInsurance(newInsurance);
      setEditingInsurance(false);
      if (onSave) onSave(contacts, newInsurance);
    } catch (error) {
      console.error('Error saving insurance:', error);
      alert('Error saving insurance information');
    }
  };

  const handleUpdateInsurance = (field: keyof InsuranceInfo, value: string | Date) => {
    setNewInsurance({ ...newInsurance, [field]: value });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Emergency Contacts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                People to contact in case of emergency
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Contact Form */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Add New Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contactName">Full Name</Label>
                  <Input
                    id="contactName"
                    placeholder="John Doe"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contactRelationship">Relationship</Label>
                  <Input
                    id="contactRelationship"
                    placeholder="Spouse, Parent, etc."
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    placeholder="(555) 123-4567"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email (Optional)</Label>
                  <Input
                    id="contactEmail"
                    placeholder="email@example.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                className="mt-3" 
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.phone}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {/* Contacts List */}
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`border rounded-lg p-4 ${contact.isPrimary ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{contact.name}</h3>
                        {contact.isPrimary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.relationship}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.phone}</span>
                        </div>
                        
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        
                        {contact.address && (
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-muted-foreground" />
                            <span>{contact.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {editingContact === contact.id ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSaveContact(contact.id)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingContact(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditContact(contact.id)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          {!contact.isPrimary && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMakePrimary(contact.id)}
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemoveContact(contact.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingContact === contact.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Input
                            value={contact.relationship}
                            onChange={(e) => handleUpdateContact(contact.id, 'relationship', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={contact.email || ''}
                            onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Insurance Information
              </CardTitle>
              <CardDescription>
                Your health insurance details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editingInsurance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Insurance Provider</Label>
                  <Input
                    id="provider"
                    value={newInsurance.provider}
                    onChange={(e) => handleUpdateInsurance('provider', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={newInsurance.policyNumber}
                    onChange={(e) => handleUpdateInsurance('policyNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    value={newInsurance.memberId}
                    onChange={(e) => handleUpdateInsurance('memberId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="primaryHolder">Primary Holder</Label>
                  <Input
                    id="primaryHolder"
                    value={newInsurance.primaryHolder}
                    onChange={(e) => handleUpdateInsurance('primaryHolder', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={newInsurance.effectiveDate.toISOString().split('T')[0]}
                    onChange={(e) => handleUpdateInsurance('effectiveDate', new Date(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={newInsurance.expirationDate.toISOString().split('T')[0]}
                    onChange={(e) => handleUpdateInsurance('expirationDate', new Date(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePhone">Insurance Phone</Label>
                  <Input
                    id="insurancePhone"
                    value={newInsurance.phone}
                    onChange={(e) => handleUpdateInsurance('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="groupNumber">Group Number (Optional)</Label>
                  <Input
                    id="groupNumber"
                    value={newInsurance.groupNumber || ''}
                    onChange={(e) => handleUpdateInsurance('groupNumber', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="insuranceNotes">Notes (Optional)</Label>
                <Input
                  id="insuranceNotes"
                  value={newInsurance.notes || ''}
                  onChange={(e) => handleUpdateInsurance('notes', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveInsurance}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Insurance
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingInsurance(false);
                    setNewInsurance(insurance);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Insurance Provider</Label>
                  <p className="font-medium">{insurance.provider}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Policy Number</Label>
                  <p className="font-medium">{insurance.policyNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Member ID</Label>
                  <p className="font-medium">{insurance.memberId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Primary Holder</Label>
                  <p className="font-medium">{insurance.primaryHolder}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Effective Date</Label>
                  <p className="font-medium">{formatDate(insurance.effectiveDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expiration Date</Label>
                  <p className="font-medium">{formatDate(insurance.expirationDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Insurance Phone</Label>
                  <p className="font-medium">{insurance.phone}</p>
                </div>
                {insurance.groupNumber && (
                  <div>
                    <Label className="text-muted-foreground">Group Number</Label>
                    <p className="font-medium">{insurance.groupNumber}</p>
                  </div>
                )}
              </div>
              
              {insurance.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{insurance.notes}</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingInsurance(true);
                  setNewInsurance({...insurance});
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Insurance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyContacts;
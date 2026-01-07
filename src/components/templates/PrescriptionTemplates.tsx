import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Pill, 
  Clock, 
  User, 
  Edit3, 
  Save, 
  X,
  Trash2,
  Tag,
  Calendar
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  form: string; // e.g., 'tablet', 'capsule', 'syrup'
  strength: string;
  frequency: string; // e.g., 'once daily', 'twice daily'
  duration: string; // e.g., '7 days', '2 weeks'
  instructions: string;
}

interface PrescriptionTemplate {
  id: string;
  name: string;
  category: string; // e.g., 'Cardiology', 'Dermatology', 'General'
  description: string;
  medications: Medication[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrescriptionTemplatesProps {
  doctorId?: string;
  onTemplateSelect?: (template: PrescriptionTemplate) => void;
  canEdit?: boolean;
}

const PrescriptionTemplates: React.FC<PrescriptionTemplatesProps> = ({ 
  doctorId, 
  onTemplateSelect, 
  canEdit = true 
}) => {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([
    {
      id: '1',
      name: 'Hypertension Management',
      category: 'Cardiology',
      description: 'Standard medication regimen for hypertension',
      medications: [
        {
          id: 'med1',
          name: 'Lisinopril',
          dosage: '10mg',
          form: 'tablet',
          strength: '10mg',
          frequency: 'once daily',
          duration: '30 days',
          instructions: 'Take in the morning with water'
        }
      ],
      notes: 'Monitor blood pressure weekly',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Diabetes Management',
      category: 'Endocrinology',
      description: 'Standard medication for Type 2 diabetes',
      medications: [
        {
          id: 'med2',
          name: 'Metformin',
          dosage: '500mg',
          form: 'tablet',
          strength: '500mg',
          frequency: 'twice daily',
          duration: '30 days',
          instructions: 'Take with meals to reduce stomach upset'
        }
      ],
      notes: 'Monitor blood glucose levels',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: '3',
      name: 'Antibiotic Treatment',
      category: 'General',
      description: 'Common antibiotic for bacterial infections',
      medications: [
        {
          id: 'med3',
          name: 'Amoxicillin',
          dosage: '500mg',
          form: 'capsule',
          strength: '500mg',
          frequency: 'three times daily',
          duration: '7 days',
          instructions: 'Complete full course even if feeling better'
        }
      ],
      notes: 'Check for allergies before prescribing',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrescriptionTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState<Omit<PrescriptionTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: '',
    description: '',
    medications: [],
    notes: ''
  });
  
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id'>>({
    name: '',
    dosage: '',
    form: '',
    strength: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Get unique categories
  const categories = ['all', ...new Set(templates.map(t => t.category))];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;
    
    const medication: Medication = {
      ...newMedication,
      id: `med_${Date.now()}`
    };
    
    setNewTemplate({
      ...newTemplate,
      medications: [...newTemplate.medications, medication]
    });
    
    setNewMedication({
      name: '',
      dosage: '',
      form: '',
      strength: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleRemoveMedication = (id: string) => {
    setNewTemplate({
      ...newTemplate,
      medications: newTemplate.medications.filter(med => med.id !== id)
    });
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.description) return;

    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { 
              ...newTemplate, 
              id: editingTemplate.id,
              createdAt: editingTemplate.createdAt,
              updatedAt: new Date() 
            } 
          : t
      ));
    } else {
      // Add new template
      const template: PrescriptionTemplate = {
        ...newTemplate,
        id: `template_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTemplates([...templates, template]);
    }

    // Reset form
    setNewTemplate({
      name: '',
      category: '',
      description: '',
      medications: [],
      notes: ''
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleEditTemplate = (template: PrescriptionTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category,
      description: template.description,
      medications: [...template.medications],
      notes: template.notes || ''
    });
    setShowForm(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleUseTemplate = (template: PrescriptionTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Prescription Templates
              </CardTitle>
              <CardDescription>
                Pre-defined templates for common prescriptions
              </CardDescription>
            </div>
            
            {canEdit && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Template Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate ? 'Edit Prescription Template' : 'Create New Prescription Template'}
            </CardTitle>
            <CardDescription>
              {editingTemplate 
                ? 'Update the details for this prescription template' 
                : 'Define a new template for common prescriptions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Hypertension Treatment"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <Input
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    placeholder="e.g., Cardiology, General"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Brief description of the prescription"
                  rows={2}
                />
              </div>
              
              {/* Medications Section */}
              <div>
                <h3 className="font-medium mb-2">Medications</h3>
                
                {/* Add Medication Form */}
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">Add New Medication</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-sm">Medication Name</label>
                      <Input
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Dosage</label>
                      <Input
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Form</label>
                      <Input
                        value={newMedication.form}
                        onChange={(e) => setNewMedication({...newMedication, form: e.target.value})}
                        placeholder="e.g., tablet"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Strength</label>
                      <Input
                        value={newMedication.strength}
                        onChange={(e) => setNewMedication({...newMedication, strength: e.target.value})}
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Frequency</label>
                      <Input
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        placeholder="e.g., once daily"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Duration</label>
                      <Input
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                        placeholder="e.g., 30 days"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block mb-1 text-sm">Instructions</label>
                    <Input
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                      placeholder="e.g., Take with food"
                    />
                  </div>
                  <Button 
                    className="mt-3" 
                    onClick={handleAddMedication}
                    disabled={!newMedication.name || !newMedication.dosage}
                  >
                    Add Medication
                  </Button>
                </div>
                
                {/* Medications List */}
                <div className="space-y-2">
                  {newTemplate.medications.map(medication => (
                    <div key={medication.id} className="border rounded-lg p-3 flex justify-between items-start">
                      <div>
                        <div className="font-medium">{medication.name} - {medication.dosage}</div>
                        <div className="text-sm text-muted-foreground">
                          {medication.form}, {medication.strength}, {medication.frequency} for {medication.duration}
                        </div>
                        {medication.instructions && (
                          <div className="text-sm mt-1">{medication.instructions}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMedication(medication.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Notes</label>
                <Textarea
                  value={newTemplate.notes}
                  onChange={(e) => setNewTemplate({...newTemplate, notes: e.target.value})}
                  placeholder="Additional notes about the prescription"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    setNewTemplate({
                      name: '',
                      category: '',
                      description: '',
                      medications: [],
                      notes: ''
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

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    {template.name}
                  </CardTitle>
                  <Badge className="mt-2">{template.category}</Badge>
                </div>
                
                {canEdit && (
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span>{template.medications.length} medication{template.medications.length !== 1 ? 's' : ''}</span>
                </div>
                
                {template.medications.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {template.medications.map(med => med.name).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUseTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No prescription templates found</p>
            <p className="text-sm">Try changing your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionTemplates;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Stethoscope, 
  Clock, 
  User, 
  Edit3, 
  Save, 
  X,
  Trash2,
  Tag
} from 'lucide-react';

interface LabTestTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  requiredFields: string[];
  estimatedTime: number; // in minutes
  cost: number;
  normalRanges?: Record<string, string>; // e.g., { glucose: '70-100 mg/dL' }
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LabTestTemplatesProps {
  doctorId?: string;
  onTemplateSelect?: (template: LabTestTemplate) => void;
  canEdit?: boolean;
}

const LabTestTemplates: React.FC<LabTestTemplatesProps> = ({ 
  doctorId, 
  onTemplateSelect, 
  canEdit = true 
}) => {
  const [templates, setTemplates] = useState<LabTestTemplate[]>([
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description: 'Measures different blood cell types and counts',
      instructions: 'Fasting not required. Blood sample from vein.',
      requiredFields: ['Patient ID', 'Date', 'Hemoglobin', 'Hematocrit', 'RBC Count', 'WBC Count', 'Platelet Count'],
      estimatedTime: 30,
      cost: 45.00,
      normalRanges: {
        hemoglobin: '12-16 g/dL (female), 14-18 g/dL (male)',
        hematocrit: '36-46% (female), 41-53% (male)',
        'rbc count': '4.0-5.2 x 10^6/µL',
        'wbc count': '4,000-11,000/µL',
        platelets: '150,000-450,000/µL'
      },
      notes: 'Common test for overall health assessment',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Basic Metabolic Panel (BMP)',
      category: 'Chemistry',
      description: 'Measures blood sugar, electrolyte, and kidney function',
      instructions: '8-12 hour fast required. Blood sample from vein.',
      requiredFields: ['Patient ID', 'Date', 'Glucose', 'Calcium', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'BUN', 'Creatinine'],
      estimatedTime: 45,
      cost: 65.00,
      normalRanges: {
        glucose: '70-100 mg/dL',
        sodium: '136-145 mEq/L',
        potassium: '3.5-5.0 mEq/L',
        chloride: '98-107 mEq/L',
        'bun': '7-20 mg/dL',
        creatinine: '0.6-1.2 mg/dL'
      },
      notes: 'Often ordered as part of routine health checkup',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: '3',
      name: 'Lipid Panel',
      category: 'Chemistry',
      description: 'Measures cholesterol and triglyceride levels',
      instructions: '9-12 hour fast required. Blood sample from vein.',
      requiredFields: ['Patient ID', 'Date', 'Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
      estimatedTime: 45,
      cost: 55.00,
      normalRanges: {
        'total cholesterol': '<200 mg/dL',
        hdl: '>40 mg/dL (male), >50 mg/dL (female)',
        ldl: '<100 mg/dL (optimal)',
        triglycerides: '<150 mg/dL'
      },
      notes: 'Important for cardiovascular risk assessment',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabTestTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState<Omit<LabTestTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: '',
    description: '',
    instructions: '',
    requiredFields: [],
    estimatedTime: 30,
    cost: 0,
    normalRanges: {},
    notes: ''
  });
  
  const [newField, setNewField] = useState('');
  const [newRangeName, setNewRangeName] = useState('');
  const [newRangeValue, setNewRangeValue] = useState('');

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

  const handleAddField = () => {
    if (newField.trim() && !newTemplate.requiredFields.includes(newField.trim())) {
      setNewTemplate({
        ...newTemplate,
        requiredFields: [...newTemplate.requiredFields, newField.trim()]
      });
      setNewField('');
    }
  };

  const handleRemoveField = (field: string) => {
    setNewTemplate({
      ...newTemplate,
      requiredFields: newTemplate.requiredFields.filter(f => f !== field)
    });
  };

  const handleAddRange = () => {
    if (newRangeName.trim() && newRangeValue.trim()) {
      setNewTemplate({
        ...newTemplate,
        normalRanges: {
          ...newTemplate.normalRanges,
          [newRangeName.trim()]: newRangeValue.trim()
        }
      });
      setNewRangeName('');
      setNewRangeValue('');
    }
  };

  const handleRemoveRange = (rangeName: string) => {
    const newRanges = { ...newTemplate.normalRanges };
    delete newRanges[rangeName];
    setNewTemplate({
      ...newTemplate,
      normalRanges: newRanges
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
      const template: LabTestTemplate = {
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
      instructions: '',
      requiredFields: [],
      estimatedTime: 30,
      cost: 0,
      normalRanges: {},
      notes: ''
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleEditTemplate = (template: LabTestTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category,
      description: template.description,
      instructions: template.instructions,
      requiredFields: [...template.requiredFields],
      estimatedTime: template.estimatedTime,
      cost: template.cost,
      normalRanges: template.normalRanges ? { ...template.normalRanges } : {},
      notes: template.notes || ''
    });
    setShowForm(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleUseTemplate = (template: LabTestTemplate) => {
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
                <FileText className="w-5 h-5" />
                Lab Test Templates
              </CardTitle>
              <CardDescription>
                Pre-defined templates for common lab tests
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
              {editingTemplate ? 'Edit Lab Test Template' : 'Create New Lab Test Template'}
            </CardTitle>
            <CardDescription>
              {editingTemplate 
                ? 'Update the details for this lab test template' 
                : 'Define a new template for common lab tests'}
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
                    placeholder="e.g., Complete Blood Count"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Category</label>
                  <Input
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    placeholder="e.g., Hematology, Chemistry"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Brief description of the test"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Instructions</label>
                <Textarea
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate({...newTemplate, instructions: e.target.value})}
                  placeholder="Instructions for patient and lab staff"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Estimated Time (minutes)</label>
                  <Input
                    type="number"
                    value={newTemplate.estimatedTime}
                    onChange={(e) => setNewTemplate({...newTemplate, estimatedTime: parseInt(e.target.value) || 30})}
                    placeholder="e.g., 30"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTemplate.cost}
                    onChange={(e) => setNewTemplate({...newTemplate, cost: parseFloat(e.target.value) || 0})}
                    placeholder="e.g., 45.00"
                  />
                </div>
              </div>
              
              {/* Required Fields */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Required Fields</label>
                  <div className="flex gap-2">
                    <Input
                      value={newField}
                      onChange={(e) => setNewField(e.target.value)}
                      placeholder="Add field name"
                      className="w-48"
                    />
                    <Button type="button" onClick={handleAddField} size="sm">
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {newTemplate.requiredFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {field}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveField(field)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Normal Ranges */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Normal Ranges</label>
                  <div className="flex gap-2">
                    <Input
                      value={newRangeName}
                      onChange={(e) => setNewRangeName(e.target.value)}
                      placeholder="Parameter name"
                      className="w-32"
                    />
                    <Input
                      value={newRangeValue}
                      onChange={(e) => setNewRangeValue(e.target.value)}
                      placeholder="Normal range"
                      className="w-48"
                    />
                    <Button type="button" onClick={handleAddRange} size="sm">
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {newTemplate.normalRanges && Object.entries(newTemplate.normalRanges).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="font-medium">{name}:</span>
                      <div className="flex items-center gap-2">
                        <span>{value}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveRange(name)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Notes</label>
                <Textarea
                  value={newTemplate.notes}
                  onChange={(e) => setNewTemplate({...newTemplate, notes: e.target.value})}
                  placeholder="Additional notes about the test"
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
                      instructions: '',
                      requiredFields: [],
                      estimatedTime: 30,
                      cost: 0,
                      normalRanges: {},
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
                    <Stethoscope className="w-5 h-5 text-blue-500" />
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
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{template.estimatedTime} min</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>${template.cost.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span>{template.requiredFields.length} fields</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
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
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No lab test templates found</p>
            <p className="text-sm">Try changing your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabTestTemplates;
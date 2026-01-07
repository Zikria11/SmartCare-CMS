import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Users,
  Stethoscope,
  FileSpreadsheet,
  Table,
  Calendar as CalendarIcon
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'excel' | 'csv';
  dateGenerated: Date;
  size: string;
  category: 'appointment' | 'patient' | 'doctor' | 'financial' | 'lab' | 'vaccination';
  generatedBy: string;
}

interface ReportsExportProps {
  role?: string;
}

const ReportsExport: React.FC<ReportsExportProps> = ({ role = 'admin' }) => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Monthly Appointment Summary',
      description: 'Summary of all appointments for November 2024',
      type: 'pdf',
      dateGenerated: new Date('2024-12-01'),
      size: '2.4 MB',
      category: 'appointment',
      generatedBy: 'System'
    },
    {
      id: '2',
      title: 'Patient Demographics Report',
      description: 'Demographics breakdown of all registered patients',
      type: 'excel',
      dateGenerated: new Date('2024-11-28'),
      size: '1.8 MB',
      category: 'patient',
      generatedBy: 'Admin'
    },
    {
      id: '3',
      title: 'Doctor Performance Metrics',
      description: 'Productivity and patient satisfaction metrics for doctors',
      type: 'pdf',
      dateGenerated: new Date('2024-11-25'),
      size: '3.1 MB',
      category: 'doctor',
      generatedBy: 'System'
    },
    {
      id: '4',
      title: 'Financial Summary Report',
      description: 'Revenue and expense summary for Q4 2024',
      type: 'excel',
      dateGenerated: new Date('2024-11-20'),
      size: '1.2 MB',
      category: 'financial',
      generatedBy: 'Accountant'
    },
    {
      id: '5',
      title: 'Lab Results Summary',
      description: 'Summary of lab test results for October 2024',
      type: 'pdf',
      dateGenerated: new Date('2024-11-15'),
      size: '4.7 MB',
      category: 'lab',
      generatedBy: 'Lab Technician'
    },
    {
      id: '6',
      title: 'Vaccination Coverage Report',
      description: 'Vaccination rates and coverage analysis',
      type: 'csv',
      dateGenerated: new Date('2024-11-10'),
      size: '850 KB',
      category: 'vaccination',
      generatedBy: 'System'
    }
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({
    start: null,
    end: null
  });

  // Get unique categories and types
  const categories = ['all', ...new Set(reports.map(r => r.category))];
  const types = ['all', ...new Set(reports.map(r => r.type))];

  // Filter reports based on selections
  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesType = selectedType === 'all' || report.type === selectedType;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(report.dateGenerated) >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(report.dateGenerated) <= dateRange.end;
    }
    
    return matchesCategory && matchesType && matchesDate;
  });

  const handleDownload = (reportId: string) => {
    // In a real app, this would download the actual report
    alert(`Downloading report ${reportId}`);
  };

  const handleGenerateReport = (category: string) => {
    // In a real app, this would generate a new report
    alert(`Generating new ${category} report...`);
  };

  const getReportIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case 'patient':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-purple-500" />;
      case 'financial':
        return <BarChart3 className="w-5 h-5 text-orange-500" />;
      case 'lab':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'vaccination':
        return <Table className="w-5 h-5 text-teal-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'excel':
        return 'bg-green-100 text-green-800';
      case 'csv':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <Download className="w-5 h-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Generate and download analytics reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">File Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value ? new Date(e.target.value) : null})}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value ? new Date(e.target.value) : null})}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Reports</CardTitle>
          <CardDescription>
            Select a report type to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('appointment')}
            >
              <CalendarIcon className="w-8 h-8 mb-2 text-blue-500" />
              <span className="font-medium">Appointment Report</span>
              <span className="text-sm text-muted-foreground">Summary of appointments</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('patient')}
            >
              <Users className="w-8 h-8 mb-2 text-green-500" />
              <span className="font-medium">Patient Report</span>
              <span className="text-sm text-muted-foreground">Patient demographics</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('doctor')}
            >
              <Stethoscope className="w-8 h-8 mb-2 text-purple-500" />
              <span className="font-medium">Doctor Report</span>
              <span className="text-sm text-muted-foreground">Performance metrics</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('financial')}
            >
              <BarChart3 className="w-8 h-8 mb-2 text-orange-500" />
              <span className="font-medium">Financial Report</span>
              <span className="text-sm text-muted-foreground">Revenue & expense summary</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('lab')}
            >
              <FileText className="w-8 h-8 mb-2 text-red-500" />
              <span className="font-medium">Lab Report</span>
              <span className="text-sm text-muted-foreground">Lab results summary</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center p-6 h-32"
              onClick={() => handleGenerateReport('vaccination')}
            >
              <Table className="w-8 h-8 mb-2 text-teal-500" />
              <span className="font-medium">Vaccination Report</span>
              <span className="text-sm text-muted-foreground">Coverage analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No reports match your filters</p>
              <p className="text-sm">Try changing your filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div 
                  key={report.id} 
                  className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getReportIcon(report.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{report.title}</h3>
                        <Badge className={getTypeColor(report.type)}>
                          {report.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Generated: </span>
                          <span>{formatDate(report.dateGenerated)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size: </span>
                          <span>{report.size}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">By: </span>
                          <span>{report.generatedBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleDownload(report.id)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Report Statistics</CardTitle>
          <CardDescription>
            Overview of available reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {reports.filter(r => r.type === 'pdf').length}
              </div>
              <div className="text-sm text-muted-foreground">PDF Reports</div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {reports.filter(r => r.type === 'excel' || r.type === 'csv').length}
              </div>
              <div className="text-sm text-muted-foreground">Spreadsheet Reports</div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">By Category:</h4>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c !== 'all').map(category => {
                const count = reports.filter(r => r.category === category).length;
                return (
                  <Badge key={category} variant="secondary" className="text-sm">
                    {category.charAt(0).toUpperCase() + category.slice(1)}: {count}
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

export default ReportsExport;
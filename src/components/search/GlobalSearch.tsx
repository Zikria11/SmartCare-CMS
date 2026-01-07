import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Calendar, 
  FileText, 
  Stethoscope, 
  Users,
  ChevronRight,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'patient' | 'doctor' | 'appointment' | 'medical-record' | 'lab-report';
  title: string;
  subtitle: string;
  url: string;
  lastUpdated?: Date;
  meta?: Record<string, string>;
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  onResultSelect, 
  placeholder = 'Search patients, doctors, appointments...',
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data for search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'patient',
      title: 'John Smith',
      subtitle: 'Patient ID: PAT-001',
      url: '/PatientDashboard',
      lastUpdated: new Date('2024-12-15'),
      meta: {
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567'
      }
    },
    {
      id: '2',
      type: 'doctor',
      title: 'Dr. Sarah Johnson',
      subtitle: 'Cardiologist',
      url: '/DoctorDashboard',
      lastUpdated: new Date('2024-12-10'),
      meta: {
        department: 'Cardiology',
        license: 'MED-12345'
      }
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Regular Checkup',
      subtitle: 'John Smith with Dr. Sarah Johnson',
      url: '/PatientDashboard/appointments',
      lastUpdated: new Date('2024-12-20'),
      meta: {
        date: 'Dec 20, 2024 10:00 AM',
        status: 'Scheduled'
      }
    },
    {
      id: '4',
      type: 'medical-record',
      title: 'Annual Physical Examination',
      subtitle: 'John Smith - Dec 15, 2024',
      url: '/PatientDashboard/history',
      lastUpdated: new Date('2024-12-15'),
      meta: {
        doctor: 'Dr. Sarah Johnson',
        diagnosis: 'Healthy'
      }
    },
    {
      id: '5',
      type: 'lab-report',
      title: 'Complete Blood Count',
      subtitle: 'John Smith - Results Ready',
      url: '/PatientDashboard/lab-reports',
      lastUpdated: new Date('2024-12-18'),
      meta: {
        lab: 'Main Lab',
        status: 'Completed'
      }
    }
  ];

  // Simulate search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.meta && Object.values(result.meta).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      
      setResults(filteredResults);
      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectResult = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-green-500" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'medical-record':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'lab-report':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  const getResultBadge = (type: string) => {
    switch (type) {
      case 'patient':
        return <Badge variant="secondary" className="text-xs">Patient</Badge>;
      case 'doctor':
        return <Badge variant="secondary" className="text-xs">Doctor</Badge>;
      case 'appointment':
        return <Badge variant="secondary" className="text-xs">Appointment</Badge>;
      case 'medical-record':
        return <Badge variant="secondary" className="text-xs">Record</Badge>;
      case 'lab-report':
        return <Badge variant="secondary" className="text-xs">Lab Report</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Other</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setIsOpen(true)}
          className="pl-10 pr-10 py-6 text-lg"
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{result.title}</h3>
                          {getResultBadge(result.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {result.subtitle}
                        </p>
                        {result.lastUpdated && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {formatDate(result.lastUpdated)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default GlobalSearch;
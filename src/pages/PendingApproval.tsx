import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Clock, ArrowLeft, Mail } from 'lucide-react';

const PendingApproval = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
            <Clock className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">Pending Approval</h1>
          
          <p className="text-muted-foreground">
            Your registration as a <span className="font-semibold capitalize">{profile?.role?.replace('_', ' ')}</span> is currently under review.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-4">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5" />
            <span>You'll receive an email once approved</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            An administrator will review your application shortly. This process typically takes 1-2 business days.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

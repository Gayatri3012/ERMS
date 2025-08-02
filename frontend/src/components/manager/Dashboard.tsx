import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { User, Assignment, Project, Engineer } from '../../types';
import TeamOverview from './TeamOverview';
import { 
  Users, 
  FolderOpen, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn-components';
import { Alert, AlertDescription } from '@/components/ui/shadcn-components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn-components';
import { calculateEngineersCapacity, getCapacitySummary } from '@/utils/engineerCapacity';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { engineers, projects, assignments } = state;
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEngineers: 0,
    activeProjects: 0,
    avgUtilization: 0,
    overloadedEngineers: 0
  });
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [capacityAlerts, setCapacityAlerts] = useState<User[]>([]);

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (engineers?.length > 0 && assignments.length > 0) {
      calculateStats();
      getRecentAssignments();
      getCapacityAlerts();
    }
  }, [engineers, assignments, projects]);

// Alternative approach using getCapacitySummary for even cleaner code:
const calculateStats = () => {
  const activeProjects = projects.filter((p: Project) => p.status === 'active').length;
  const capacitySummary = getCapacitySummary(engineers, assignments);
  
  setStats({
    totalEngineers: capacitySummary.totalEngineers,
    activeProjects,
    avgUtilization: Math.round(capacitySummary.utilizationPercentage),
    overloadedEngineers: capacitySummary.overallocatedCount
  });
};

  const getRecentAssignments = () => {
    const recent = assignments
      .sort((a: Assignment, b: Assignment) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
    setRecentAssignments(recent);
  };

// Replace the entire getCapacityAlerts function with:
const getCapacityAlerts = () => {
  const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments);
  
  const alerts: User[] = engineersWithCapacity
    .filter(engineer => 
      engineer.capacityInfo.totalAllocated > engineer.maxCapacity || 
      engineer.capacityInfo.totalAllocated < 30
    )
    .map(engineer => ({
      ...engineer,
      currentUtilization: engineer.capacityInfo.totalAllocated
    } as User & { currentUtilization: number }));
  
  setCapacityAlerts(alerts);
};

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEngineerName = (engineerId: string) => {
    const engineer = engineers.find((e: Engineer) => e._id === engineerId);
    return engineer?.name || 'Unknown Engineer';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: Project) => p._id.toString() === projectId.toString());
    return project?.name || 'Unknown Project';
  };

  if (!user || user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to managers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Manage your engineering team and projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Engineers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEngineers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgUtilization}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Capacity Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{capacityAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
     
         
              <div className="space-y-6">
                {/* Capacity Alerts */}
                {capacityAlerts.length > 0 && (
                  <Alert className="border-red-200 bg-red-100" variant='destructive'>
                    
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className='flex gap-2'><AlertTriangle className="h-4 w-4 text-red-600" /><h3 className="font-medium text-red-900 mb-3">Capacity Alerts</h3></div>
                        
                        {capacityAlerts.map((engineer) => (
                          <div key={engineer._id} className="flex justify-between items-center">
                            <span className="text-red-800">{engineer.name}</span>
                            <span className="text-sm text-red-600">
                              {(engineer as any).currentUtilization > engineer.maxCapacity! 
                                ? `Overloaded: ${(engineer as any).currentUtilization}%`
                                : `Underutilized: ${(engineer as any).currentUtilization}%`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <TeamOverview />
                

            

          
            </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { User, Assignment, Project, Engineer } from '../../types';
import TeamOverview from './TeamOverview';
import AssignmentForm from './AssignmentForm'; 
import ProjectForm from './ProjectForm';
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

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { engineers, projects, assignments } = state;
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
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

  const calculateStats = () => {
    const totalEngineers = engineers.length;
    const activeProjects = projects.filter((p: Project) => p.status === 'active').length;

    // Calculate average utilization
    let totalUtilization = 0;
    let overloaded = 0;

    engineers.forEach((engineer: Engineer) => {
      const engineerAssignments = assignments.filter((a: Assignment) =>
        a.engineerId._id === engineer._id &&
        new Date(a.startDate) <= new Date() &&
        new Date(a.endDate) >= new Date()
      );
      const utilization = engineerAssignments.reduce((sum: number, a: Assignment) => sum + a.allocationPercentage, 0);
      totalUtilization += utilization;
      
      if (utilization > engineer.maxCapacity) {
        overloaded++;
      }
    });
    
    const avgUtilization = totalEngineers > 0 ? Math.round(totalUtilization / totalEngineers) : 0;
    
    setStats({
      totalEngineers,
      activeProjects,
      avgUtilization,
      overloadedEngineers: overloaded
    });
  };

  const getRecentAssignments = () => {
    const recent = assignments
      .sort((a: Assignment, b: Assignment) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
    setRecentAssignments(recent);
  };

  const getCapacityAlerts = () => {
    const alerts: User[] = [];

    engineers.forEach((engineer: Engineer) => {
      const engineerAssignments = assignments.filter((a: Assignment) =>
        a.engineerId._id === engineer._id &&
        new Date(a.startDate) <= new Date() &&
        new Date(a.endDate) >= new Date()
      );
      const utilization = engineerAssignments.reduce((sum: number, a: Assignment) => sum + a.allocationPercentage, 0);
      
      // Alert for overloaded (>100%) or underutilized (<30%) engineers
      if (utilization > engineer.maxCapacity || utilization < 30) {
        alerts.push({
          ...engineer,
          currentUtilization: utilization
        } as User & { currentUtilization: number });
      }
    });
    
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
            <div className="flex space-x-3">
              <Button onClick={() => setShowAssignmentForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">        

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
            <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <Calendar className="h-5 w-5 inline mr-2" />
                    Recent Assignments
                  </h3>
                  <div className="rounded-md border">
                    {recentAssignments.length === 0 ? (
                      <p className="p-4 text-gray-500">No assignments yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Engineer</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Allocation</TableHead>
                            <TableHead>Start Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentAssignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                              <TableCell className="font-medium">
                                {getEngineerName(assignment.engineerId._id)}
                              </TableCell>
                              <TableCell>
                                {getProjectName(assignment.projectId._id)}
                              </TableCell>
                              <TableCell>{assignment.role}</TableCell>
                              <TableCell>{assignment.allocationPercentage}%</TableCell>
                              <TableCell>{formatDate(assignment.startDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
            </div>           
        </div>
      </div>

      {/* Modals */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Assignment</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssignmentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            <AssignmentForm onClose={() => setShowAssignmentForm(false)} isOpen={showAssignmentForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
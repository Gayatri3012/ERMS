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

const Dashboard: React.FC = () => {
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
                <p className="text-2xl font-bold text-gray-900">{stats.overloadedEngineers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm rounded-none ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('team')}
                className={`py-4 px-1 border-b-2 font-medium text-sm rounded-none ${
                  activeTab === 'team'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Team Management
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm rounded-none ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
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

                {/* Recent Assignments */}
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
            )}

            {activeTab === 'team' && (
              <TeamOverview />
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">All Projects</h3>
                </div>
                <div className="rounded-md border">
                  {projects.length === 0 ? (
                    <p className="p-4 text-gray-500">No projects yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Team Size</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project: any) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{project.name}</div>
                                <div className="text-sm text-gray-500">{project.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === 'active' ? 'bg-green-100 text-green-800' :
                                project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>{formatDate(project.endDate)}</TableCell>
                            <TableCell>{project.teamSize}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      
    </div>
  );
};

export default Dashboard;
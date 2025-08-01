import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { User, Assignment, Project, Engineer } from '../../types';
import ProjectForm from './ProjectForm';
import { 
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn-components';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn-components';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { projects } = state;
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

 

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
              <Button onClick={() => setShowProjectForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
        
          <div className="p-6">
              

          
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
          </div>
        </div>
      </div>



      {showProjectForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Project</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            <ProjectForm onClose={() => setShowProjectForm(false)} isOpen={showProjectForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
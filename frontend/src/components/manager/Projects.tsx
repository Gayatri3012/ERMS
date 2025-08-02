import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../types';
import ProjectForm from './ProjectForm';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '@/components/ui/shadcn-components';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { projects, assignments } = state;
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'endDate' | 'status'>('name');

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

  // Get unique skills from all projects
  const allProjectSkills = useMemo(() => {
    const skills = new Set<string>();
    projects.forEach(project => {
      if (project.requiredSkills) {
        project.requiredSkills.forEach(skill => skills.add(skill));
      }
    });
    return Array.from(skills).sort();
  }, [projects]);

  // Enhanced projects with additional calculated data
  const enhancedProjects = useMemo(() => {
    return projects.map(project => {
      // Get assignments for this project
      const projectAssignments = assignments.filter(assignment => 
        assignment.projectId === project._id || 
        (typeof assignment.projectId === 'object' && assignment.project?._id === project._id)
      );

      // Calculate current team size
      const currentTeamSize = projectAssignments.filter(assignment => 
        new Date(assignment.endDate) > new Date() && 
        new Date(assignment.startDate) <= new Date()
      ).length;

      return {
        ...project,
        currentTeamSize,
        projectAssignments
      };
    });
  }, [projects, assignments]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return enhancedProjects
      .filter(project => {
        const matchesSearch = 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.requiredSkills && project.requiredSkills.some(skill => 
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ));

        const matchesStatus = !statusFilter || project.status === statusFilter;
        
        const matchesSkill = !skillFilter || 
          (project.requiredSkills && project.requiredSkills.includes(skillFilter));

        return matchesSearch && matchesStatus && matchesSkill;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'startDate':
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          case 'endDate':
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [enhancedProjects, searchTerm, statusFilter, skillFilter, sortBy]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'planning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'on-hold':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    fetchProjects(); // Refresh projects after create/edit
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
              <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
              <p className="text-gray-600">Manage your engineering projects and resources</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Planning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'planning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name, description, or required skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                {allProjectSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="startDate">Sort by Start Date</option>
                <option value="endDate">Sort by End Date</option>
                <option value="status">Sort by Status</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <div className="rounded-md border">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {projects.length === 0 
                      ? "Get started by creating your first project."
                      : "Try adjusting your search criteria or filters."
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Required Skills</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project: any) => (
                      <TableRow key={project._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {project.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(project.status)}
                            <Badge variant={
                              project.status === 'active' ? 'success' :
                              project.status === 'planning' ? 'warning' :
                              project.status === 'completed' ? 'default' :
                              project.status === 'on-hold' ? 'destructive' :
                              'secondary'
                            }>
                              {project.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {project.requiredSkills?.slice(0, 3).map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="default"
                              >
                                {skill}
                              </Badge>
                            )) || <span className="text-sm text-gray-400">No skills specified</span>}
                            {project.requiredSkills?.length > 3 && (
                              <Badge variant="secondary">
                                +{project.requiredSkills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{formatDate(project.startDate)}</div>
                            <div className="text-gray-500">to {formatDate(project.endDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {project.currentTeamSize} / {project.teamSize || 0}
                            </div>
                            <div className="text-gray-500">assigned</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            <ProjectForm 
              onClose={handleCloseForm} 
              isOpen={showProjectForm}
              project={editingProject}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { ProjectFormData } from '../../types';
import { X, AlertCircle, Plus, Minus } from 'lucide-react';

// Validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name is too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  teamSize: z.number().min(1, 'Team size must be at least 1').max(50, 'Team size cannot exceed 50'),
  status: z.enum(['planning', 'active', 'completed']),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
    editingProject?: Project | null;
}

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java',
  'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'C#',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'DevOps', 'Machine Learning', 'Data Science',
  'React Native', 'Flutter', 'Vue.js', 'Angular', 'Django', 'Flask',
  'Spring Boot', 'Express.js', 'GraphQL', 'REST API', 'Microservices'
];

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createProject } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'planning',
      teamSize: 3,
    }
  });

  const filteredSkills = SKILL_OPTIONS.filter(skill =>
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillSearchTerm('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleAddCustomSkill = () => {
    if (skillSearchTerm.trim() && !selectedSkills.includes(skillSearchTerm.trim())) {
      setSelectedSkills([...selectedSkills, skillSearchTerm.trim()]);
      setSkillSearchTerm('');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const projectData = {
        ...data,
        requiredSkills: selectedSkills,
        teamSize: Number(data.teamSize),
        managerId: user?._id || '',
      };

      await createProject(projectData);
      
      reset();
      setSelectedSkills([]);
      setSkillSearchTerm('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedSkills([]);
    setSkillSearchTerm('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the project goals, scope, and key deliverables"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="date"
                id="startDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                {...register('endDate')}
                type="date"
                id="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                Team Size *
              </label>
              <input
                {...register('teamSize', { valueAsNumber: true })}
                type="number"
                id="teamSize"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="3"
              />
              {errors.teamSize && (
                <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              {...register('status')}
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills
            </label>
            
            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Search */}
            <div className="relative">
              <input
                type="text"
                value={skillSearchTerm}
                onChange={(e) => setSkillSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search and add skills..."
              />
              
              {skillSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      {skill}
                    </button>
                  ))}
                  
                  {filteredSkills.length === 0 && skillSearchTerm.trim() && (
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-blue-600"
                    >
                      <Plus className="inline h-4 w-4 mr-1" />
                      Add "{skillSearchTerm.trim()}" as custom skill
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <p className="mt-1 text-sm text-gray-500">
              Search for skills or type to add custom skills. Selected: {selectedSkills.length}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../context/AppContext';
import type { AssignmentFormData } from '../../types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/shadcn-components';
import { Alert, AlertDescription } from '@/components/ui/shadcn-components';

// Validation schema
const assignmentSchema = z.object({
  engineerId: z.string().min(1, 'Please select an engineer'),
  projectId: z.string().min(1, 'Please select a project'),
  allocationPercentage: z.number()
    .min(1, 'Allocation must be at least 1%')
    .max(100, 'Allocation cannot exceed 100%'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  role: z.string().min(1, 'Role is required'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEngineerId?: string;
  onSuccess?: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  isOpen,
  onClose,
  preselectedEngineerId,
  onSuccess
}) => {
  const { state, createAssignment, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<string>('');
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      role: 'Developer',
      allocationPercentage: 25,
    }
  });

  const watchedEngineerId = watch('engineerId');
  const watchedAllocation = watch('allocationPercentage');

  useEffect(() => {
    if (isOpen) {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
      
      if (preselectedEngineerId) {
        setValue('engineerId', preselectedEngineerId);
        setSelectedEngineer(preselectedEngineerId);
      }
    }
  }, [isOpen, preselectedEngineerId]);

  useEffect(() => {
    if (watchedEngineerId) {
      setSelectedEngineer(watchedEngineerId);
      checkCapacity(watchedEngineerId, watchedAllocation || 0);
    }
  }, [watchedEngineerId, watchedAllocation]);

  const checkCapacity = (engineerId: string, allocation: number) => {
    const engineer = state.engineers.find(e => e._id === engineerId);
    if (!engineer) return;

    const currentAssignments = state.assignments.filter(
      assignment => assignment.engineerId === engineerId &&
      new Date(assignment.endDate) > new Date()
    );

    const totalAllocated = currentAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage, 0
    );

    const newTotal = totalAllocated + allocation;
    const available = engineer.maxCapacity - totalAllocated;

    if (newTotal > engineer.maxCapacity) {
      setCapacityWarning(
        `This assignment would overload ${engineer.name}. Current: ${totalAllocated}%, New total: ${newTotal}%, Max capacity: ${engineer.maxCapacity}%`
      );
    } else if (allocation > available) {
      setCapacityWarning(
        `${engineer.name} only has ${available}% capacity available. Current allocation: ${totalAllocated}%`
      );
    } else {
      setCapacityWarning(null);
    }
  };

  const getEngineerCapacityInfo = (engineerId: string) => {
    const engineer = state.engineers.find(e => e._id === engineerId);
    if (!engineer) return null;

    const currentAssignments = state.assignments.filter(
      assignment => assignment.engineerId === engineerId &&
      new Date(assignment.endDate) > new Date()
    );

    const totalAllocated = currentAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage, 0
    );

    return {
      engineer,
      totalAllocated,
      available: engineer.maxCapacity - totalAllocated
    };
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await createAssignment({
        engineerId: data.engineerId,
        projectId: data.projectId,
        allocationPercentage: Number(data.allocationPercentage),
        startDate: data.startDate,
        endDate: data.endDate,
        role: data.role,
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setCapacityWarning(null);
    onClose();
  };

  if (!isOpen) return null;

  const selectedEngineerInfo = selectedEngineer ? getEngineerCapacityInfo(selectedEngineer) : null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Create New Assignment</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {error && (
          <Alert className="mb-4 border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {capacityWarning && (
          <Alert className="mb-4 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              {capacityWarning}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="engineerId" className="block text-sm font-medium text-gray-700 mb-1">
                Engineer *
              </label>
              <select
                {...register('engineerId')}
                id="engineerId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an engineer</option>
                {state.engineers.map((engineer) => (
                  <option key={engineer._id} value={engineer._id}>
                    {engineer.name} ({engineer.seniority})
                  </option>
                ))}
              </select>
              {errors.engineerId && (
                <p className="mt-1 text-sm text-red-600">{errors.engineerId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                {...register('projectId')}
                id="projectId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project</option>
                {state.projects.filter(p => p.status !== 'completed').map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>
          </div>

          {selectedEngineerInfo && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Capacity Information</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current:</span>
                  <div className="font-medium">{selectedEngineerInfo.totalAllocated}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Available:</span>
                  <div className="font-medium text-green-600">{selectedEngineerInfo.available}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Max Capacity:</span>
                  <div className="font-medium">{selectedEngineerInfo.engineer.maxCapacity}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="allocationPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Percentage *
              </label>
              <input
                {...register('allocationPercentage', { valueAsNumber: true })}
                type="number"
                id="allocationPercentage"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="25"
              />
              {errors.allocationPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.allocationPercentage.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                {...register('role')}
                id="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Developer">Developer</option>
                <option value="Tech Lead">Tech Lead</option>
                <option value="Senior Developer">Senior Developer</option>
                <option value="Architect">Architect</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="QA Engineer">QA Engineer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Assignment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
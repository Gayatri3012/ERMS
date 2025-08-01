import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Assignment, Project } from '../../types';
import  CapacityBar  from '../ui/CapacityBar';
import { Calendar, Clock, User, Settings } from 'lucide-react';
import EngineerAssignments from './EngineerAssignments';
import EngineerProfile from './EngineerProfile';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchAssignments, fetchProjects , getEngineerCapacity} = useApp();
  const {assignments, projects} = state;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userAssignments, setUserAssignments] = useState<Assignment[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (user && assignments.length > 0) {
      // Filter assignments for current user
      const myAssignments = assignments.filter((assignment: Assignment) => 
        assignment.engineerId._id.toString() === user._id.toString()
      );
      setUserAssignments(myAssignments);

      // Calculate total capacity used
      const today = new Date();
      const activeAssignments = myAssignments.filter((assignment: Assignment) => 
        new Date(assignment.startDate) <= today && new Date(assignment.endDate) >= today
      );
      (async () => {
        const response = await getEngineerCapacity(user._id);
        setTotalCapacity(user.maxCapacity! - response.availableCapacity);
    })();

      // Get current projects
      const projectIds = activeAssignments.map((assignment: Assignment) => assignment.projectId._id);
      const activeProjects = projects.filter((project: Project) => 
        projectIds.includes(project._id)
      );
      setCurrentProjects(activeProjects);
    }
  }, [user, assignments, projects]);



  const upcomingAssignments = userAssignments.filter(assignment => 
    new Date(assignment.startDate) > new Date()
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's your current workload and upcoming assignments
          </p>
        </div>

        {/* Capacity Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Capacity
            </h2>
            <span className="text-sm text-gray-500">
              {totalCapacity}% of {user.maxCapacity}% capacity
            </span>
          </div>
          <CapacityBar 
            current={totalCapacity} 
            max={user.maxCapacity!} 
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {user.seniority} {user.role}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">
                  {user.maxCapacity! - totalCapacity}% Available
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-900">
                  {currentProjects.length} Active Projects
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Projects */}
        <EngineerAssignments />

        {/* Skills & Profile */}
        
        <EngineerProfile />
      </div>
    </div>
  );
};

export default Dashboard;
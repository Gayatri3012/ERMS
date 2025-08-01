import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
// import type { Engineer } from '../types';
import CapacityBar from '../ui/CapacityBar';
import { Search, Filter, Plus, User } from 'lucide-react';

interface TeamOverviewProps {
  onCreateAssignment?: (engineerId: string) => void;
}

const TeamOverview: React.FC<TeamOverviewProps> = ({ onCreateAssignment }) => {
  const { state, fetchEngineers, fetchAssignments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    fetchEngineers();
    fetchAssignments();
  }, []);

  // Calculate capacity for each engineer
  const engineersWithCapacity = state.engineers.map(engineer => {
      console.log('=== DEBUG INFO ===');
  console.log('Total assignments in state:', state.assignments.length);
  console.log('Current engineer:', engineer.name, 'ID:', engineer._id);
  
  if (state.assignments.length > 0) {
    console.log('Sample assignment:', state.assignments[0]);
    console.log('Assignment keys:', Object.keys(state.assignments[0]));
  }
    
  const engineerAssignments = state.assignments.filter(assignment => {
    // Type-safe way to handle both string ID and populated object
    let assignmentEngineerId: string;
    
    if (typeof assignment.engineerId === 'string') {
      assignmentEngineerId = assignment.engineerId;
    } else if (assignment.engineerId && typeof assignment.engineerId === 'object' && '_id' in assignment.engineerId) {
      assignmentEngineerId = (assignment.engineerId as any)._id;
    } else {
      return false;
    }
    
    return assignmentEngineerId === engineer._id &&
           new Date(assignment.endDate) > new Date();
  });
  
    const totalAllocated = engineerAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage, 0
    );
    
    return {
      ...engineer,
      totalAllocated,
      availableCapacity: engineer.maxCapacity - totalAllocated,
      assignments: engineerAssignments
    };
  });

  // Get all unique skills for filter
  const allSkills = Array.from(
    new Set(state.engineers.flatMap(engineer => engineer.skills))
  ).sort();

  // Filter engineers based on search and filters
  const filteredEngineers = engineersWithCapacity.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !skillFilter || engineer.skills.includes(skillFilter);
    const matchesSeniority = !seniorityFilter || engineer.seniority === seniorityFilter;
    
    const matchesCapacity = !capacityFilter || 
      (capacityFilter === 'available' && engineer.availableCapacity > 0) ||
      (capacityFilter === 'overloaded' && engineer.totalAllocated > engineer.maxCapacity) ||
      (capacityFilter === 'full' && engineer.availableCapacity === 0);

    return matchesSearch && matchesSkill && matchesSeniority && matchesCapacity;
  });

  const getCapacityStatus = (allocated: number, max: number) => {
    const percentage = (allocated / max) * 100;
    if (percentage > 100) return 'Overloaded';
    if (percentage >= 90) return 'At Capacity';
    if (percentage >= 70) return 'High Load';
    return 'Available';
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading team data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Overview</h2>
        <div className="text-sm text-gray-600">
          {filteredEngineers.length} of {state.engineers.length} engineers
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search engineers by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <select
            value={seniorityFilter}
            onChange={(e) => setSeniorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>

          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Capacity</option>
            <option value="available">Available</option>
            <option value="full">At Capacity</option>
            <option value="overloaded">Overloaded</option>
          </select>
        </div>
      </div>

      {/* Engineers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engineer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEngineers.map((engineer) => (
              <tr key={engineer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {engineer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {engineer.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {engineer.seniority} • {engineer.department}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {engineer.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {engineer.skills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{engineer.skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <CapacityBar
                      current={engineer.totalAllocated}
                      max={engineer.maxCapacity}
                      size="sm"
                      showText={false}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {engineer.totalAllocated}% / {engineer.maxCapacity}%
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    engineer.totalAllocated > engineer.maxCapacity
                      ? 'bg-red-100 text-red-800'
                      : engineer.totalAllocated >= engineer.maxCapacity * 0.9
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getCapacityStatus(engineer.totalAllocated, engineer.maxCapacity)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {onCreateAssignment && (
                    <button
                      onClick={() => onCreateAssignment(engineer._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEngineers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamOverview;
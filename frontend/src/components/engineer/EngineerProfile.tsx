import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
;
import { Settings } from 'lucide-react';

const EngineerProfile: React.FC = () => {
  const { user } = useAuth();
  const { fetchAssignments, fetchProjects } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);


  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchProjects();
    }
  }, [user]);





  if (!user) {
    return <div>Loading...</div>;
  }

  return (

      <div className="max-w-7xl mx-auto  mt-6">

        {/* Skills & Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills listed</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{user.department || 'Not specified'}</span>
                </div>
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Seniority:</span>
                  <span className="font-medium capitalize">{user.seniority}</span>
                </div>
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Employment:</span>
                  <span className="font-medium">
                    {user.maxCapacity === 100 ? 'Full-time' : 'Part-time'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isEditingProfile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Profile editing functionality would be implemented here.
                This would include forms to update skills, department, and other editable fields.
              </p>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

  );
};

export default EngineerProfile;
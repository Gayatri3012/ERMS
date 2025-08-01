import React, { useState } from 'react';

// Card Components
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

// Button Component
export const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-900',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Table Components
export const Table = ({ children, className = '' }) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="border-b">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`p-4 align-middle ${className}`}>
    {children}
  </td>
);

// Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    outline: 'text-gray-900 border-gray-200',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Progress Component
export const Progress = ({ value = 0, className = '', ...props }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
    <div 
      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

// Alert Components
export const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white border-gray-200',
    destructive: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    success: 'border-green-200 bg-green-50 text-green-900',
  };
  
  return (
    <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm opacity-90 ${className}`}>
    {children}
  </div>
);

export const AlertTitle = ({ children, className = '' }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
    {children}
  </h5>
);

// Separator Component
export const Separator = ({ orientation = 'horizontal', className = '' }) => (
  <div
    className={`shrink-0 bg-gray-200 ${
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
    } ${className}`}
  />
);

// Tabs Components
export const Tabs = ({ children, defaultValue, value, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);
  
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };
  
  return (
    <div className={`w-full ${className}`}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, onTabChange, className = '' }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, onTabChange })
    )}
  </div>
);

export const TabsTrigger = ({ children, value, activeTab, onTabChange, className = '' }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value 
        ? 'bg-white text-gray-950 shadow-sm' 
        : 'text-gray-500 hover:text-gray-900'
    } ${className}`}
    onClick={() => onTabChange(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ children, value, activeTab, className = '' }) => {
  if (value !== activeTab) return null;
  return (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
};

// Input Component
export const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Label Component
export const Label = ({ children, className = '', htmlFor, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);

// Select Components
export const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  
  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.cloneElement(child, { 
          isOpen, 
          setIsOpen, 
          selectedValue, 
          onSelect: handleSelect 
        })
      )}
    </div>
  );
};

export const SelectTrigger = ({ children, isOpen, setIsOpen, className = '' }) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const SelectValue = ({ placeholder, selectedValue }) => (
  <span className={selectedValue ? 'text-gray-900' : 'text-gray-500'}>
    {selectedValue || placeholder}
  </span>
);

export const SelectContent = ({ children, isOpen, className = '' }) => {
  if (!isOpen) return null;
  
  return (
    <div className={`absolute top-full z-50 w-full rounded-md border border-gray-200 bg-white py-1 shadow-md ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem = ({ children, value, onSelect, className = '' }) => (
  <div
    onClick={() => onSelect(value)}
    className={`relative flex cursor-pointer select-none items-center py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
  >
    {children}
  </div>
);

// Dialog Components (Modal)
export const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = '' }) => (
  <div className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 rounded-lg ${className}`}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

export const DialogFooter = ({ children, className = '' }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
    {children}
  </div>
);
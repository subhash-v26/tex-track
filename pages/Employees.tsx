import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Pencil, Trash2, Search, UserRound, Phone, X, Check, ChevronLeft } from 'lucide-react';
import { Employee } from '../types';

export const Employees: React.FC = () => {
  const { employees, deleteEmployee } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    deleteEmployee(id);
    setDeletingId(null);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Employee Management</h2>
            <p className="text-sm text-slate-500">Manage your workforce, roles and records</p>
          </div>
        </div>
        <Button type="button" onClick={() => navigate('/employees/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Employee
        </Button>
      </div>

      <Card>
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search employees by name or role..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{employee.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{employee.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {deletingId === employee.id ? (
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => confirmDelete(employee.id)}
                        className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-all"
                        title="Confirm Delete"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-all"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button"
                        onClick={() => navigate(`/employees/edit/${employee.id}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit Employee"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeletingId(employee.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Phone size={14} className="mr-2 text-slate-400" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-xs text-slate-400 uppercase tracking-wider font-semibold pt-2 border-t border-slate-100">
                  Joined: {employee.joined_date}
                </div>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <UserRound className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No employees found matching your search.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
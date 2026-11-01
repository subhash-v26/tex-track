
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ChevronLeft, Save, UserPlus, AlertCircle } from 'lucide-react';
import { Employee } from '../types';

export const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, addEmployee, updateEmployee } = useData();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Stitching' as Employee['role'],
    joined_date: todayStr
  });

  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const employee = employees.find(e => e.id === id);
      if (employee) {
        setFormData({
          name: employee.name,
          phone: employee.phone,
          role: employee.role,
          joined_date: employee.joined_date
        });
      } else {
        navigate('/employees');
      }
    }
  }, [id, isEditMode, employees, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.phone) return;

    if (formData.joined_date > todayStr) {
      setError("Joining date cannot be in the future.");
      return;
    }

    try {
      if (isEditMode && id) {
        await updateEmployee({
          id,
          ...formData
        } as Employee);
      } else {
        await addEmployee(formData as Omit<Employee, 'id'>);
      }
      navigate('/employees');
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/employees')}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Update Employee' : 'New Employee'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEditMode ? 'Modify existing employee information' : 'Register a new member to your workforce'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="e.g. Rajesh Kumar"
              className="text-base py-3"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Phone Number" 
                type="tel"
                value={formData.phone} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({...formData, phone: val});
                }} 
                required 
                placeholder="10-digit mobile"
              />
              
              <Select 
                 label="Job Role"
                 options={['Stitching', 'Cutting', 'Packing', 'Helper'].map(r => ({label: r, value: r}))}
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value as Employee['role']})}
              />
            </div>

            <Input 
                label="Joining Date"
                type="date"
                value={formData.joined_date}
                max={todayStr}
                onChange={e => setFormData({...formData, joined_date: e.target.value})}
                required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={formData.joined_date > todayStr}>
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Employee
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

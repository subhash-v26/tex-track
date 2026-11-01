import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Employee, 
  ProductionEntry, 
  DispatchEntry, 
  Transaction, 
  User, 
  PayrollRecord, 
  UserRole, 
  InventoryItem 
} from '../types';
import { supabase } from './supabase';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_PRODUCTION_LOGS, 
  INITIAL_DISPATCH_LOGS, 
  INITIAL_TRANSACTIONS, 
  MOCK_USER 
} from '../constants';

interface DataContextType {
  user: User | null;
  products: Product[];
  employees: Employee[];
  productionLogs: ProductionEntry[];
  dispatchLogs: DispatchEntry[];
  transactions: Transaction[];
  isLoading: boolean;
  isDemoMode: boolean;
  loadDemoData: () => void;
  clearAllData: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addProductionLog: (log: Omit<ProductionEntry, 'id' | 'timestamp'>) => Promise<void>;
  updateProductionLog: (log: ProductionEntry) => Promise<void>;
  deleteProductionLog: (id: string) => Promise<void>;
  addDispatchLog: (log: Omit<DispatchEntry, 'id' | 'timestamp'>) => Promise<void>;
  deleteDispatchLog: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  calculatePayroll: (start: string, end: string) => PayrollRecord[];
  getInventory: () => InventoryItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('texflow_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [productionLogs, setProductionLogs] = useState<ProductionEntry[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('texflow_demo_active') === 'true';
  });

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`texflow_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  };

  const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`texflow_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const loadDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setEmployees(INITIAL_EMPLOYEES);
    setProductionLogs(INITIAL_PRODUCTION_LOGS);
    setDispatchLogs(INITIAL_DISPATCH_LOGS);
    setTransactions(INITIAL_TRANSACTIONS);
    setIsDemoMode(true);

    saveToLocalStorage('products', INITIAL_PRODUCTS);
    saveToLocalStorage('employees', INITIAL_EMPLOYEES);
    saveToLocalStorage('production_logs', INITIAL_PRODUCTION_LOGS);
    saveToLocalStorage('dispatch_logs', INITIAL_DISPATCH_LOGS);
    saveToLocalStorage('transactions', INITIAL_TRANSACTIONS);
    localStorage.setItem('texflow_demo_active', 'true');
  };

  const clearAllData = () => {
    setProducts([]);
    setEmployees([]);
    setProductionLogs([]);
    setDispatchLogs([]);
    setTransactions([]);
    setIsDemoMode(false);

    localStorage.removeItem('texflow_products');
    localStorage.removeItem('texflow_employees');
    localStorage.removeItem('texflow_production_logs');
    localStorage.removeItem('texflow_dispatch_logs');
    localStorage.removeItem('texflow_transactions');
    localStorage.removeItem('texflow_demo_active');
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const loggedUser: User = {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata.full_name || 'Admin',
            email: session.user.email || '',
            role: (profile?.role as UserRole) || UserRole.ADMIN
          };
          setUser(loggedUser);
          localStorage.setItem('texflow_user', JSON.stringify(loggedUser));
        }

        const [
          { data: prodData },
          { data: empData },
          { data: logData },
          { data: dispatchData },
          { data: transData }
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('employees').select('*'),
          supabase.from('production_logs').select('*').order('date', { ascending: false }),
          supabase.from('dispatch_logs').select('*').order('date', { ascending: false }),
          supabase.from('transactions').select('*').order('date', { ascending: false })
        ]);

        const hasRemoteData = (prodData && prodData.length > 0) || 
                              (empData && empData.length > 0) || 
                              (logData && logData.length > 0);

        if (hasRemoteData) {
          if (prodData) setProducts(prodData);
          if (empData) setEmployees(empData);
          if (logData) setProductionLogs(logData);
          if (dispatchData) setDispatchLogs(dispatchData || []);
          if (transData) setTransactions(transData || []);
          setIsDemoMode(false);
          localStorage.removeItem('texflow_demo_active');
        } else {
          // If remote is empty, check if demo mode was activated in localStorage
          const demoActive = localStorage.getItem('texflow_demo_active') === 'true';
          if (demoActive) {
            setProducts(loadFromLocalStorage('products', INITIAL_PRODUCTS));
            setEmployees(loadFromLocalStorage('employees', INITIAL_EMPLOYEES));
            setProductionLogs(loadFromLocalStorage('production_logs', INITIAL_PRODUCTION_LOGS));
            setDispatchLogs(loadFromLocalStorage('dispatch_logs', INITIAL_DISPATCH_LOGS));
            setTransactions(loadFromLocalStorage('transactions', INITIAL_TRANSACTIONS));
            setIsDemoMode(true);
          } else {
            // Check if user has offline saved data
            const localProds = loadFromLocalStorage<Product[]>('products', []);
            if (localProds.length > 0) {
              setProducts(localProds);
              setEmployees(loadFromLocalStorage('employees', []));
              setProductionLogs(loadFromLocalStorage('production_logs', []));
              setDispatchLogs(loadFromLocalStorage('dispatch_logs', []));
              setTransactions(loadFromLocalStorage('transactions', []));
            }
          }
        }

      } catch (error) {
        console.error('Data Fetch Error (Falling back to local cache):', error);
        const demoActive = localStorage.getItem('texflow_demo_active') === 'true';
        if (demoActive) {
          setProducts(loadFromLocalStorage('products', INITIAL_PRODUCTS));
          setEmployees(loadFromLocalStorage('employees', INITIAL_EMPLOYEES));
          setProductionLogs(loadFromLocalStorage('production_logs', INITIAL_PRODUCTION_LOGS));
          setDispatchLogs(loadFromLocalStorage('dispatch_logs', INITIAL_DISPATCH_LOGS));
          setTransactions(loadFromLocalStorage('transactions', INITIAL_TRANSACTIONS));
          setIsDemoMode(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } }
      });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Registration failed' };
      const newUser: User = { id: data.user.id, name, email, role: UserRole.ADMIN };
      setUser(newUser);
      localStorage.setItem('texflow_user', JSON.stringify(newUser));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      if (email === 'admin@texflow.com' && pass === 'password') {
        const mockUser: User = { id: 'u1', name: 'Admin User', email: 'admin@texflow.com', role: UserRole.ADMIN };
        setUser(mockUser);
        localStorage.setItem('texflow_user', JSON.stringify(mockUser));
        return { success: true };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        if (error.message.includes('Email not confirmed')) return { success: false, error: 'Please check your email and confirm your account.' };
        return { success: false, error: 'Invalid login credentials' };
      }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        const loggedUser: User = {
          id: data.user.id,
          name: profile?.name || data.user.user_metadata.full_name || 'Admin',
          email: data.user.email || '',
          role: profile?.role || UserRole.ADMIN
        };
        setUser(loggedUser);
        localStorage.setItem('texflow_user', JSON.stringify(loggedUser));
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (e: any) {
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('texflow_user');
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('texflow_user', JSON.stringify(updatedUser));
    await supabase.from('profiles').update({ name: updatedUser.name }).eq('id', updatedUser.id);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (!error && data && data.length > 0) {
        setProducts(prev => {
          const updated = [...prev, data[0]];
          saveToLocalStorage('products', updated);
          return updated;
        });
        return;
      }
    } catch (e) {
      console.warn('Supabase product insert failed, saving locally', e);
    }
    const newProd = { ...product, id: `p-${Date.now()}` };
    setProducts(prev => {
      const updated = [...prev, newProd];
      saveToLocalStorage('products', updated);
      return updated;
    });
  };

  const updateProduct = async (product: Product) => {
    try {
      await supabase.from('products').update(product).eq('id', product.id);
    } catch (e) {
      console.warn('Supabase product update failed, updating locally', e);
    }
    setProducts(prev => {
      const updated = prev.map(p => p.id === product.id ? product : p);
      saveToLocalStorage('products', updated);
      return updated;
    });
  };

  const deleteProduct = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete product failed', e);
    }
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToLocalStorage('products', updated);
      return updated;
    });
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const { data, error } = await supabase.from('employees').insert([employee]).select();
      if (!error && data && data.length > 0) {
        setEmployees(prev => {
          const updated = [...prev, data[0]];
          saveToLocalStorage('employees', updated);
          return updated;
        });
        return;
      }
    } catch (e) {
      console.warn('Supabase employee insert failed, saving locally', e);
    }
    const newEmp = { ...employee, id: `e-${Date.now()}` };
    setEmployees(prev => {
      const updated = [...prev, newEmp];
      saveToLocalStorage('employees', updated);
      return updated;
    });
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      await supabase.from('employees').update(employee).eq('id', employee.id);
    } catch (e) {
      console.warn('Supabase employee update failed', e);
    }
    setEmployees(prev => {
      const updated = prev.map(e => e.id === employee.id ? employee : e);
      saveToLocalStorage('employees', updated);
      return updated;
    });
  };

  const deleteEmployee = async (id: string) => {
    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase employee delete failed', e);
    }
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveToLocalStorage('employees', updated);
      return updated;
    });
  };

  const addProductionLog = async (log: Omit<ProductionEntry, 'id' | 'timestamp'>) => {
    const newLog = { ...log, timestamp: Date.now() };
    try {
      const { data, error } = await supabase.from('production_logs').insert([newLog]).select();
      if (!error && data && data.length > 0) {
        setProductionLogs(prev => {
          const updated = [data[0], ...prev];
          saveToLocalStorage('production_logs', updated);
          return updated;
        });
        return;
      }
    } catch (e) {
      console.warn('Supabase log insert failed, saving locally', e);
    }
    const localEntry: ProductionEntry = { ...newLog, id: `prod-${Date.now()}` };
    setProductionLogs(prev => {
      const updated = [localEntry, ...prev];
      saveToLocalStorage('production_logs', updated);
      return updated;
    });
  };

  const updateProductionLog = async (log: ProductionEntry) => {
    try {
      await supabase.from('production_logs').update(log).eq('id', log.id);
    } catch (e) {
      console.warn('Supabase log update failed', e);
    }
    setProductionLogs(prev => {
      const updated = prev.map(l => l.id === log.id ? log : l);
      saveToLocalStorage('production_logs', updated);
      return updated;
    });
  };

  const deleteProductionLog = async (id: string) => {
    try {
      await supabase.from('production_logs').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase log delete failed', e);
    }
    setProductionLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveToLocalStorage('production_logs', updated);
      return updated;
    });
  };

  const addDispatchLog = async (log: Omit<DispatchEntry, 'id' | 'timestamp'>) => {
    const newLog = { ...log, timestamp: Date.now() };
    try {
      const { data, error } = await supabase.from('dispatch_logs').insert([newLog]).select();
      if (!error && data && data.length > 0) {
        setDispatchLogs(prev => {
          const updated = [data[0], ...prev];
          saveToLocalStorage('dispatch_logs', updated);
          return updated;
        });
        return;
      }
    } catch (e) {
      console.warn('Supabase dispatch insert failed, saving locally', e);
    }
    const localDispatch: DispatchEntry = { ...newLog, id: `disp-${Date.now()}` };
    setDispatchLogs(prev => {
      const updated = [localDispatch, ...prev];
      saveToLocalStorage('dispatch_logs', updated);
      return updated;
    });
  };

  const deleteDispatchLog = async (id: string) => {
    try {
      await supabase.from('dispatch_logs').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase dispatch delete failed', e);
    }
    setDispatchLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveToLocalStorage('dispatch_logs', updated);
      return updated;
    });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await supabase.from('transactions').insert([transaction]).select();
      if (!error && data && data.length > 0) {
        setTransactions(prev => {
          const updated = [data[0], ...prev];
          saveToLocalStorage('transactions', updated);
          return updated;
        });
        return;
      }
    } catch (e) {
      console.warn('Supabase transaction insert failed, saving locally', e);
    }
    const localTx: Transaction = { ...transaction, id: `tx-${Date.now()}` };
    setTransactions(prev => {
      const updated = [localTx, ...prev];
      saveToLocalStorage('transactions', updated);
      return updated;
    });
  };

  const deleteTransaction = async (id: string) => {
    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase transaction delete failed', e);
    }
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveToLocalStorage('transactions', updated);
      return updated;
    });
  };

  const calculatePayroll = (start: string, end: string): PayrollRecord[] => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();

    return employees.map(employee => {
      const employeeLogs = productionLogs.filter(log => {
        const logTime = new Date(log.date).getTime();
        return log.employee_id === employee.id && logTime >= startDate && logTime <= endDate;
      });

      let totalAmount = 0;
      let totalPieces = 0;

      employeeLogs.forEach(log => {
        const product = products.find(p => p.id === log.product_id);
        if (product) {
          totalAmount += log.quantity * product.price_per_piece;
          totalPieces += log.quantity;
        }
      });

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalPieces,
        totalHours: 0,
        totalAmount,
        periodStart: start,
        periodEnd: end,
      };
    });
  };

  const getInventory = (): InventoryItem[] => {
    return products.map(product => {
      const totalProduced = productionLogs
        .filter(log => log.product_id === product.id)
        .reduce((sum, log) => sum + log.quantity, 0);
      
      const totalDispatched = dispatchLogs
        .filter(log => log.product_id === product.id)
        .reduce((sum, log) => sum + log.quantity, 0);

      return {
        product_id: product.id,
        name: product.name,
        category: product.category,
        image_url: product.image_url,
        total_produced: totalProduced,
        total_dispatched: totalDispatched,
        current_stock: totalProduced - totalDispatched
      };
    });
  };

  return (
    <DataContext.Provider value={{
      user, products, employees, productionLogs, dispatchLogs, transactions, isLoading,
      isDemoMode, loadDemoData, clearAllData,
      login, signup, logout, updateUser, addProduct, updateProduct, deleteProduct,
      addEmployee, updateEmployee, deleteEmployee, addProductionLog, updateProductionLog,
      deleteProductionLog, addDispatchLog, deleteDispatchLog, addTransaction, deleteTransaction, 
      calculatePayroll, getInventory
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
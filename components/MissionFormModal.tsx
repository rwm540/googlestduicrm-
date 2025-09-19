import React, { useState, useEffect } from 'react';
import { Mission, MissionTask, User } from '../types';
import Modal from './Modal';
import Alert from './Alert';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import DatePicker from './DatePicker';
import { formatJalaali, parseJalaali } from '../utils/dateFormatter';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mission: Mission | Omit<Mission, 'id'>) => void;
  mission: Mission | null;
  users: User[];
  currentUser: User;
}

const inputClass = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm";

// Internal form state with separate date/time fields for easier management
interface MissionFormData {
    title: string;
    description: string;
    assignedTo: number;
    tasks: MissionTask[];
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
}

const getInitialState = (currentUser: User): Omit<Mission, 'id'> => {
  return {
    title: '',
    description: '',
    assignedTo: 0,
    createdBy: currentUser.id,
    tasks: [{ id: Date.now(), description: '', completed: false }],
    startTimestamp: new Date().toISOString(),
    endTimestamp: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  };
};

const MissionFormModal: React.FC<MissionFormModalProps> = ({ isOpen, onClose, onSave, mission, users, currentUser }) => {
  const [formData, setFormData] = useState<MissionFormData>(() => {
      const initialState = getInitialState(currentUser);
      const startDate = new Date(initialState.startTimestamp);
      const endDate = new Date(initialState.endTimestamp);
      return {
          title: initialState.title,
          description: initialState.description,
          assignedTo: initialState.assignedTo,
          tasks: initialState.tasks,
          startDate: formatJalaali(startDate),
          startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
          endDate: formatJalaali(endDate),
          endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      }
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
        if (mission) {
            const startDateObj = new Date(mission.startTimestamp);
            const endDateObj = new Date(mission.endTimestamp);
            setFormData({
                title: mission.title,
                description: mission.description,
                assignedTo: mission.assignedTo,
                tasks: mission.tasks,
                startDate: formatJalaali(startDateObj),
                startTime: `${String(startDateObj.getHours()).padStart(2, '0')}:${String(startDateObj.getMinutes()).padStart(2, '0')}`,
                endDate: formatJalaali(endDateObj),
                endTime: `${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`,
            });
        } else {
            const initialState = getInitialState(currentUser);
            const startDate = new Date(initialState.startTimestamp);
            const endDate = new Date(initialState.endTimestamp);
             setFormData({
                title: initialState.title,
                description: initialState.description,
                assignedTo: initialState.assignedTo,
                tasks: initialState.tasks,
                startDate: formatJalaali(startDate),
                startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
                endDate: formatJalaali(endDate),
                endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
             });
        }
    } else {
        setTimeout(() => {
             const initialState = getInitialState(currentUser);
             const startDate = new Date(initialState.startTimestamp);
             const endDate = new Date(initialState.endTimestamp);
             setFormData({
                title: initialState.title,
                description: initialState.description,
                assignedTo: initialState.assignedTo,
                tasks: initialState.tasks,
                startDate: formatJalaali(startDate),
                startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
                endDate: formatJalaali(endDate),
                endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
            });
             setErrors([]);
        }, 300);
    }
  }, [mission, isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'assignedTo' ? Number(value) : value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleTaskChange = (taskId: number, newDescription: string) => {
    setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => task.id === taskId ? { ...task, description: newDescription } : task)
    }));
  };
  
  const addTask = () => {
    setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { id: Date.now(), description: '', completed: false }]
    }));
  };

  const removeTask = (taskId: number) => {
    setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];
    if (!formData.title.trim()) validationErrors.push('عنوان ماموریت نمی‌تواند خالی باشد.');
    if (!formData.assignedTo) validationErrors.push('باید یک کارمند برای ماموریت انتخاب شود.');
    
    const startDateTime = parseJalaali(formData.startDate);
    const endDateTime = parseJalaali(formData.endDate);
    if (startDateTime && endDateTime) {
        const [startH, startM] = formData.startTime.split(':').map(Number);
        const [endH, endM] = formData.endTime.split(':').map(Number);
        startDateTime.setHours(startH, startM);
        endDateTime.setHours(endH, endM);

        if (startDateTime >= endDateTime) {
            validationErrors.push('زمان پایان باید بعد از زمان شروع باشد.');
        }
    } else {
        validationErrors.push('فرمت تاریخ یا ساعت نامعتبر است.');
    }

    if (formData.tasks.some(t => !t.description.trim())) {
        validationErrors.push('شرح وظایف نمی‌تواند خالی باشد.');
    }
    
    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
    }
    
    // Reconstruct the final mission object
    const startTimestamp = parseJalaali(formData.startDate)!;
    const [startH, startM] = formData.startTime.split(':').map(Number);
    startTimestamp.setHours(startH, startM);

    const endTimestamp = parseJalaali(formData.endDate)!;
    const [endH, endM] = formData.endTime.split(':').map(Number);
    endTimestamp.setHours(endH, endM);

    const finalData = {
        ...(mission && { id: mission.id }),
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        createdBy: mission?.createdBy ?? currentUser.id,
        tasks: formData.tasks.filter(t => t.description.trim() !== ''),
        startTimestamp: startTimestamp.toISOString(),
        endTimestamp: endTimestamp.toISOString(),
        completed: mission?.completed ?? false,
    };
    
    onSave(finalData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-cyan-600 mb-4">
          {mission ? 'ویرایش ماموریت' : 'تعریف ماموریت جدید'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Alert messages={errors} onClose={() => setErrors([])} />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">عنوان ماموریت</label>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">کارمند</label>
                    <select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className={inputClass}>
                        <option value={0} disabled>انتخاب کنید...</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">شرح ماموریت</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={`${inputClass} min-h-[80px]`}></textarea>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ شروع</label>
                    <DatePicker value={formData.startDate} onChange={date => handleDateChange('startDate', date)} />
                </div>
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">ساعت شروع</label>
                    <input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} className={inputClass} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ پایان</label>
                    <DatePicker value={formData.endDate} onChange={date => handleDateChange('endDate', date)} />
                </div>
                 <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">ساعت پایان</label>
                    <input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} className={inputClass} />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وظایف</label>
                <div className="space-y-2">
                    {formData.tasks.map((task, index) => (
                        <div key={task.id} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={task.description}
                                onChange={(e) => handleTaskChange(task.id, e.target.value)}
                                placeholder={`وظیفه #${index + 1}`}
                                className={inputClass}
                            />
                            <button type="button" onClick={() => removeTask(task.id)} className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addTask} className="mt-2 flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800">
                    <PlusIcon />
                    <span>افزودن وظیفه</span>
                </button>
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">ذخیره ماموریت</button>
            </div>
        </form>
      </div>
    </Modal>
  );
};

export default MissionFormModal;
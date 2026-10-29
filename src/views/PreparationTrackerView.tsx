import React, { useState } from 'react';
import { User, Task, TaskCategory, TaskStatus } from '../types';
import { getTasks, addTask, updateTask, deleteTask, toggleTaskStatus } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  Search,
  BookOpen
} from 'lucide-react';

interface PreparationTrackerViewProps {
  user: User;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: TaskCategory[] = [
  'Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical Subjects',
  'Coding Practice',
  'Communication',
  'Interview Preparation',
];

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export const PreparationTrackerView: React.FC<PreparationTrackerViewProps> = ({
  user,
  onRefreshStats,
  showToast,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks(user.id));
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Aptitude');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Delete confirmation
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const refreshList = () => {
    setTasks(getTasks(user.id));
    onRefreshStats();
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Aptitude');
    setStatus('Pending');
    setTargetDate('');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setStatus(task.status);
    setTargetDate(task.targetDate || '');
    setNotes(task.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(user.id, {
        ...editingTask,
        title: title.trim(),
        category,
        status,
        targetDate: targetDate || undefined,
        notes: notes.trim() || undefined,
      });
      showToast('Task updated', 'Changes have been saved to database.', 'success');
    } else {
      addTask(user.id, {
        title: title.trim(),
        category,
        status,
        targetDate: targetDate || undefined,
        notes: notes.trim() || undefined,
      });
      showToast('Task added', 'New preparation task created.', 'success');
    }

    setIsFormOpen(false);
    refreshList();
  };

  const handleToggle = (taskId: string) => {
    const updated = toggleTaskStatus(user.id, taskId);
    if (updated?.status === 'Completed') {
      showToast('Task completed', 'Marked as completed! Dashboard updated.', 'success');
    } else if (updated?.status === 'In Progress') {
      showToast('Status changed', 'Task is now In Progress.', 'info');
    } else {
      showToast('Status changed', 'Task reset to Pending.', 'info');
    }
    refreshList();
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      deleteTask(user.id, deletingTaskId);
      showToast('Task removed', 'Task deleted from your preparation tracker.', 'info');
      setDeletingTaskId(null);
      refreshList();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchStat = selectedStatus === 'All' || t.status === selectedStatus;
    const matchQuery =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchStat && matchQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h1 className="text-2xl font-extrabold text-[#203B53] tracking-tight">
              Preparation Tasks
            </h1>
            <p className="text-xs sm:text-sm text-[#758392] mt-0.5">
              Organise your placement syllabus across aptitude, core technical subjects, and interview topics.
            </p>
          </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs sm:text-sm !py-2.5 !px-5 shrink-0 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-panel p-4 bg-white space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#758392] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syllabus tasks by topic or keyword..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
            />
          </div>

          {/* Category Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#398879] shrink-0 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] cursor-pointer"
            >
              <option value="All">All Categories ({tasks.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({tasks.filter((t) => t.category === cat).length})
                </option>
              ))}
            </select>

            {/* Status Filter dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category quick pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E2E8F0]">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#203B53] text-white shadow-2xs'
                : 'bg-[#F5F7FA] text-[#758392] hover:bg-[#E7F0FA] hover:text-[#203B53]'
            }`}
          >
            All ({tasks.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = tasks.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#398879] text-white shadow-2xs'
                    : 'bg-[#F5F7FA] text-[#758392] hover:bg-[#E7F0FA] hover:text-[#203B53]'
                }`}
              >
                {cat} {count > 0 && <span className="opacity-75 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card-panel py-16 px-4 text-center bg-white">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E7F0FA] flex items-center justify-center text-[#758392] mb-3">
            <CheckSquare className="w-6 h-6 text-[#398879]" />
          </div>
          <h3 className="text-base font-bold text-[#203B53]">
            No preparation tasks found
          </h3>
          <p className="text-xs text-[#758392] mt-1 max-w-sm mx-auto mb-4">
            {tasks.length === 0
              ? 'You have not added any preparation tasks yet. Click below to add your first syllabus topic.'
              : 'Try clearing your category or status filters to view all tasks.'}
          </p>
          {tasks.length === 0 ? (
            <button onClick={handleOpenAdd} className="btn-primary text-xs !py-2 !px-4 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Task</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="btn-secondary text-xs !py-2 !px-4 cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card-panel p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all card-panel-interactive ${
                task.status === 'Completed' ? 'opacity-85 bg-[#FCFDFE]' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => handleToggle(task.id)}
                  className="mt-0.5 shrink-0 cursor-pointer focus:outline-none"
                  title="Click to cycle status: Pending -> In Progress -> Completed"
                >
                  {task.status === 'Completed' ? (
                    <div className="w-5 h-5 rounded-md bg-[#398879] text-white flex items-center justify-center animate-pop">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : task.status === 'In Progress' ? (
                    <div className="w-5 h-5 rounded-md bg-[#E7F0FA] text-[#203B53] flex items-center justify-center border border-[#D0E2F5]">
                      <Clock className="w-3.5 h-3.5 text-[#398879]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-[#DCE3EB] hover:border-[#398879] bg-white transition-colors" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5]">
                      {task.category}
                    </span>
                    <h3
                      className={`text-sm font-semibold ${
                        task.status === 'Completed'
                          ? 'line-through text-[#758392]'
                          : 'text-[#203B53]'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-[#758392] mt-1 leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#758392]">
                    {task.targetDate && (
                      <span className="flex items-center gap-1 text-[#398879] font-medium">
                        <Calendar className="w-3 h-3" />
                        Target: {task.targetDate}
                      </span>
                    )}
                    <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                <button
                  onClick={() => handleToggle(task.id)}
                  className="cursor-pointer"
                  title="Click to cycle status"
                >
                  {task.status === 'Completed' && (
                    <span className="badge-teal px-2.5 py-1 rounded-md text-xs">Completed</span>
                  )}
                  {task.status === 'In Progress' && (
                    <span className="badge-sky px-2.5 py-1 rounded-md text-xs">In Progress</span>
                  )}
                  {task.status === 'Pending' && (
                    <span className="badge-amber px-2.5 py-1 rounded-md text-xs">
                      Pending
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-[#758392] hover:text-[#203B53] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                  title="Edit Task"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingTaskId(task.id)}
                  className="p-1.5 text-[#758392] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 border border-[#E2E8F0] shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-[#758392] hover:text-[#203B53] p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#203B53] mb-1">
              {editingTask ? 'Edit Preparation Task' : 'Add Preparation Task'}
            </h3>
            <p className="text-xs text-[#758392] mb-5">
              Specify your syllabus topic, category, and target completion date.
            </p>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#203B53] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Probability & Permutation problems"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#203B53] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203B53] mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203B53] mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#203B53] mb-1">
                  Notes / Formulas / Practice Links (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Formula: nCr = n! / (r! * (n-r)!). Watch 2 practice videos."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] text-xs sm:text-sm text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary text-xs sm:text-sm !py-2 !px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs sm:text-sm !py-2 !px-5 shadow-xs cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTaskId}
        title="Delete Preparation Task"
        message="Are you sure you want to remove this task from your preparation tracker? This action cannot be undone."
        confirmLabel="Delete Task"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingTaskId(null)}
      />
    </div>
  );
};

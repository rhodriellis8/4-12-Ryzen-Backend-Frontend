import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  X,
  Calendar,
  Link as LinkIcon,
  Trash2,
  GripVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ListChecks,
  FileText,
  BookOpen,
  TrendingUp,
  Paperclip,
  MessageSquare,
} from 'lucide-react';
import BasicDropdown from './ui/BasicDropdown';
import { useTasks, type Task, type TaskColumnId, type TaskPriority, type TaskFrequency } from '../lib/useTasks';

// ==================== TYPES ====================

interface TasksViewProps {
  userId: string;
  onNavigate?: (view: string, payload?: { type: string; id: string }) => void;
}

interface TaskModalData {
  mode: 'create' | 'edit';
  task?: Task;
  defaultColumn?: TaskColumnId;
}

interface CompletionModalData {
  taskId: string;
  taskTitle: string;
}

// ==================== CONSTANTS ====================

const COLUMNS: { id: TaskColumnId; label: string; icon: React.ReactNode }[] = [
  { id: 'backlog', label: 'Planned', icon: <ListChecks size={14} /> },
  { id: 'in_progress', label: 'In Progress', icon: <Clock size={14} /> },
  { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={14} /> },
  { id: 'review', label: 'On Hold', icon: <AlertCircle size={14} /> },
];

const TASK_TYPES = [
  { value: 'backtest', label: 'Backtest', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { value: 'review', label: 'Review', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { value: 'strategy', label: 'Strategy', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { value: 'research', label: 'Research', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { value: 'journal', label: 'Journal', color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { value: 'setup', label: 'Setup', color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { value: 'other', label: 'Other', color: 'bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-rose-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
];

// ==================== HELPER FUNCTIONS ====================

const getTaskTypeStyle = (type: string | null) => {
  const found = TASK_TYPES.find((t) => t.value === type);
  return found?.color ?? TASK_TYPES[TASK_TYPES.length - 1].color;
};

const getTaskTypeLabel = (type: string | null) => {
  const found = TASK_TYPES.find((t) => t.value === type);
  return found?.label ?? 'Other';
};

const getPriorityColor = (priority: TaskPriority | null) => {
  const found = PRIORITIES.find((p) => p.value === priority);
  return found?.color ?? 'bg-zinc-400';
};

const getDueDateStatus = (dueDate: string | null): 'overdue' | 'soon' | 'ok' | null => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff <= 2) return 'soon';
  return 'ok';
};

const formatDueDate = (dueDate: string | null) => {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ==================== SORTABLE TASK CARD ====================

interface SortableTaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onNavigateLink: (type: string, id: string) => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onEdit, onDelete, onNavigateLink }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateStatus = getDueDateStatus(task.due_date);
  const hasLinks =
    task.linked_playbook_id || task.linked_trade_id || task.linked_journal_id || task.linked_notebook_id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-lg p-3 cursor-pointer hover:border-emerald-500/30 hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50 shadow-xl ring-2 ring-emerald-500/50' : ''
      }`}
      onClick={onEdit}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      <div className="pl-4">
        {/* Title */}
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate pr-6">{task.title}</h4>
        
        {/* Description (Optional) */}
        {task.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-snug">
            {task.description}
          </p>
        )}

        {/* Type tag + Priority */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTaskTypeStyle(task.task_type)}`}>
            {getTaskTypeLabel(task.task_type)}
          </span>
          {task.priority && (
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} title={`Priority: ${task.priority}`} />
          )}
          {task.is_recurring && <RefreshCw size={12} className="text-purple-500 dark:text-purple-400" />}
        </div>

        {/* Due date + Links + Counters */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <span
                className={`text-[10px] flex items-center gap-1 ${
                  dueDateStatus === 'overdue'
                    ? 'text-rose-500 dark:text-rose-400'
                    : dueDateStatus === 'soon'
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-zinc-500'
                }`}
              >
                <Calendar size={10} />
                {formatDueDate(task.due_date)}
              </span>
            )}
            
            {/* Metadata Counters */}
            {(task.attachment_count && task.attachment_count > 0) || (task.comment_count && task.comment_count > 0) ? (
              <div className="flex items-center gap-2">
                {task.attachment_count && task.attachment_count > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                    <Paperclip size={10} />
                    <span>{task.attachment_count}</span>
                  </div>
                )}
                {task.comment_count && task.comment_count > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                    <MessageSquare size={10} />
                    <span>{task.comment_count}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {hasLinks && (
            <div className="flex items-center gap-1">
              {task.linked_playbook_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateLink('playbooks', task.linked_playbook_id!);
                  }}
                  className="p-1 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                  title="Go to Playbook"
                >
                  <BookOpen size={12} />
                </button>
              )}
              {task.linked_journal_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateLink('journal', task.linked_journal_id!);
                  }}
                  className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Go to Journal"
                >
                  <FileText size={12} />
                </button>
              )}
              {task.linked_trade_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateLink('trades', task.linked_trade_id!);
                  }}
                  className="p-1 text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  title="Go to Trade"
                >
                  <TrendingUp size={12} />
                </button>
              )}
              {task.linked_notebook_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateLink('notebooks', task.linked_notebook_id!);
                  }}
                  className="p-1 text-purple-500 dark:text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                  title="Go to Notebook"
                >
                  <BookOpen size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

// ==================== TASK CARD (for overlay) ====================

const TaskCardOverlay: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-white dark:bg-zinc-800 border border-emerald-500/50 rounded-lg p-3 shadow-2xl w-72 cursor-grabbing">
    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">{task.title}</h4>
    {task.description && (
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-snug">
        {task.description}
      </p>
    )}
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTaskTypeStyle(task.task_type)}`}>
        {getTaskTypeLabel(task.task_type)}
      </span>
      {task.priority && <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />}
    </div>
  </div>
);

// ==================== DROPPABLE COLUMN ====================

interface DroppableColumnProps {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateLink: (type: string, id: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onNavigateLink,
}) => {
  return (
    <div className="flex flex-col w-72 min-w-[288px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-gradient-to-r dark:from-zinc-800/80 dark:to-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">{column.icon}</span>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{column.label}</h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-zinc-700/50 rounded-full text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-transparent">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onNavigateLink={onNavigateLink}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-zinc-400 dark:text-zinc-600 text-xs">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== TASK MODAL ====================

interface TaskModalProps {
  data: TaskModalData;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ data, onClose, onSave, onDelete }) => {
  const isEdit = data.mode === 'edit';
  const [title, setTitle] = useState(data.task?.title ?? '');
  const [description, setDescription] = useState(data.task?.description ?? '');
  const [taskType, setTaskType] = useState(data.task?.task_type ?? 'other');
  const [priority, setPriority] = useState<TaskPriority>(data.task?.priority ?? 'low');
  const [dueDate, setDueDate] = useState(data.task?.due_date ?? '');
  const [columnId, setColumnId] = useState<TaskColumnId>(data.task?.column_id ?? data.defaultColumn ?? 'planned');
  const [isRecurring, setIsRecurring] = useState(data.task?.is_recurring ?? false);
  const [recurringFrequency, setRecurringFrequency] = useState<TaskFrequency>(data.task?.recurring_frequency ?? null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      task_type: taskType,
      priority: priority || null,
      due_date: dueDate || null,
      column_id: columnId,
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? recurringFrequency : null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              placeholder="Add details, context, or subtasks..."
              rows={3}
            />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</label>
              <BasicDropdown
                label="Select Type"
                items={TASK_TYPES.map(t => ({ id: t.value, label: t.label }))}
                selectedValue={taskType}
                onChange={(item) => setTaskType(item.id as string)}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Priority</label>
              <BasicDropdown
                label="Select Priority"
                items={PRIORITIES.map(p => ({ id: p.value, label: p.label }))}
                selectedValue={priority}
                onChange={(item) => setPriority(item.id as TaskPriority)}
                className="w-full"
              />
            </div>
          </div>

          {/* Due Date + Column */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Column</label>
              <BasicDropdown
                label="Select Column"
                items={COLUMNS.map(c => ({ id: c.id, label: c.label }))}
                selectedValue={columnId}
                onChange={(item) => setColumnId(item.id as TaskColumnId)}
                className="w-full"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                  <path d="M3.5 6.5 L5 8 L8.5 4.5" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Recurring task</span>
            </label>
            {isRecurring && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-200 w-40">
                <BasicDropdown
                  label="Select frequency..."
                  items={[
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'monthly', label: 'Monthly' }
                  ]}
                  selectedValue={recurringFrequency || ''}
                  onChange={(item) => setRecurringFrequency(item.id as TaskFrequency)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                Delete Task
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || saving}
                className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== COMPLETION MODAL ====================

interface CompletionModalProps {
  data: CompletionModalData;
  onClose: () => void;
  onComplete: (notes: string) => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ data, onClose, onComplete }) => {
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-900/30 dark:to-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Complete Task</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Completing: <span className="font-medium text-zinc-900 dark:text-zinc-100">{data.taskTitle}</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Result Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              placeholder="What was the outcome? Any learnings?"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onComplete(notes);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const TasksView: React.FC<TasksViewProps> = ({ userId, onNavigate }) => {
  const { byColumn, loading, error, createTask, updateTask, deleteTask, moveTask, moveTaskOptimistic, completeTask } = useTasks({
    userId,
  });

  const [taskModal, setTaskModal] = useState<TaskModalData | null>(null);
  const [completionModal, setCompletionModal] = useState<CompletionModalData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStartColumn, setActiveStartColumn] = useState<TaskColumnId | null>(null);


  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered tasks per column
  const filteredByColumn = useMemo(() => {
    const result: Record<TaskColumnId, Task[]> = {
      planned: [],
      in_progress: [],
      on_hold: [],
      completed: [],
    };

    COLUMNS.forEach((col) => {
      const tasks = byColumn[col.id] ?? [];
      result[col.id] = tasks.filter((task) => {
        if (typeFilter && task.task_type !== typeFilter) return false;
        if (priorityFilter && task.priority !== priorityFilter) return false;
        return true;
      });
    });

    return result;
  }, [byColumn, typeFilter, priorityFilter]);

  // Find active task for drag overlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return Object.values(byColumn).flat().find((t) => t.id === activeId) ?? null;
  }, [activeId, byColumn]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const startColumn = Object.keys(byColumn).find((col) =>
      (byColumn[col] ?? []).some((t) => t.id === active.id)
    ) as TaskColumnId | undefined;
    setActiveStartColumn(startColumn || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find active task's current column
    const activeColumn = Object.keys(byColumn).find((col) =>
      (byColumn[col] ?? []).some((t) => t.id === activeId)
    ) as TaskColumnId | undefined;

    // Find over column
    let overColumn: TaskColumnId | undefined;
    if (COLUMNS.some((c) => c.id === overId)) {
      overColumn = overId as TaskColumnId;
    } else {
      overColumn = Object.keys(byColumn).find((col) =>
        (byColumn[col] ?? []).some((t) => t.id === overId)
      ) as TaskColumnId | undefined;
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    // Calculate new index
    const overTasks = byColumn[overColumn] ?? [];
    let newIndex = overTasks.length;

    if (!COLUMNS.some((c) => c.id === overId)) {
      const overIndex = overTasks.findIndex((t) => t.id === overId);
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overTasks.length;
    }

    moveTaskOptimistic(activeId, overColumn, newIndex);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const sourceColumn = activeStartColumn;

    if (!sourceColumn) {
        setActiveId(null);
        setActiveStartColumn(null);
        return;
    }

    // Determine target column
    let targetColumn: TaskColumnId = sourceColumn;
    let newIndex = 0;

    // Check if dropped on a column header or empty area
    if (COLUMNS.some((c) => c.id === overId)) {
      targetColumn = overId as TaskColumnId;
      newIndex = (filteredByColumn[targetColumn] ?? []).length;
    } else {
      // Dropped on another task
      // Note: we look in byColumn which might have been optimistically updated,
      // but overId should still map to a valid column.
      const targetTask = Object.values(byColumn).flat().find((t) => t.id === overId);
      if (targetTask) {
        targetColumn = targetTask.column_id;
        const columnTasks = filteredByColumn[targetColumn] ?? [];
        newIndex = columnTasks.findIndex((t) => t.id === overId);
        if (newIndex === -1) newIndex = columnTasks.length;
      }
    }

    // If moving to completed column, show completion modal
    if (targetColumn === 'completed' && sourceColumn !== 'completed') {
      const task = (byColumn[sourceColumn] ?? []).find((t) => t.id === activeTaskId) || 
                   Object.values(byColumn).flat().find(t => t.id === activeTaskId); // fallback
      
      if (task) {
        setCompletionModal({ taskId: activeTaskId, taskTitle: task.title });
        setActiveId(null);
        setActiveStartColumn(null);
        return;
      }
    }

    await moveTask(activeTaskId, targetColumn, newIndex);
    setActiveId(null);
    setActiveStartColumn(null);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask(taskData as any);
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!taskModal?.task) return;
    await updateTask(taskModal.task.id, taskData);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await deleteTask(taskId);
  };

  const handleCompleteTask = async (notes: string) => {
    if (!completionModal) return;
    await completeTask(completionModal.taskId, notes || null);
  };

  const handleNavigateLink = (type: string, id: string) => {
    if (onNavigate) {
      onNavigate(type, { type, id });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-rose-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header + Filters */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your trading workflow</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <BasicDropdown
            label="All Types"
            items={[
              { id: '', label: 'All Types' },
              ...TASK_TYPES.map(t => ({ id: t.value, label: t.label }))
            ]}
            onChange={(item) => setTypeFilter(item.id as string)}
            className="w-40"
          />

          {/* Priority Filter */}
          <BasicDropdown
            label="All Priorities"
            items={[
              { id: '', label: 'All Priorities' },
              ...PRIORITIES.map(p => ({ id: p.value, label: p.label }))
            ]}
            onChange={(item) => setPriorityFilter(item.id as TaskPriority | '')}
            className="w-40"
          />

          {/* New Task Button */}
          <button
            onClick={() => setTaskModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 border border-transparent"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 pb-4 min-w-max">
            {COLUMNS.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={filteredByColumn[column.id]}
                onAddTask={() => setTaskModal({ mode: 'create', defaultColumn: column.id })}
                onEditTask={(task) => setTaskModal({ mode: 'edit', task })}
                onDeleteTask={handleDeleteTask}
                onNavigateLink={handleNavigateLink}
              />
            ))}
          </div>
          <DragOverlay>{activeTask && <TaskCardOverlay task={activeTask} />}</DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      {taskModal && (
        <TaskModal
          data={taskModal}
          onClose={() => setTaskModal(null)}
          onSave={taskModal.mode === 'create' ? handleCreateTask : handleUpdateTask}
          onDelete={taskModal.mode === 'edit' ? () => {
            handleDeleteTask(taskModal.task!.id);
            setTaskModal(null);
          } : undefined}
        />
      )}

      {/* Completion Modal */}
      {completionModal && (
        <CompletionModal
          data={completionModal}
          onClose={() => setCompletionModal(null)}
          onComplete={handleCompleteTask}
        />
      )}
    </div>
  );
};

export default TasksView;

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
} from '@dnd-kit/core';
import {
  arrayMove,
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
  Flag,
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
} from 'lucide-react';
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
  { id: 'backlog', label: 'Backlog', icon: <ListChecks size={14} /> },
  { id: 'this_week', label: 'This Week', icon: <Calendar size={14} /> },
  { id: 'in_progress', label: 'In Progress', icon: <Clock size={14} /> },
  { id: 'review', label: 'Review', icon: <AlertCircle size={14} /> },
  { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={14} /> },
];

const TASK_TYPES = [
  { value: 'backtest', label: 'Backtest', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'review', label: 'Review', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'strategy', label: 'Strategy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'research', label: 'Research', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'journal', label: 'Journal', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { value: 'setup', label: 'Setup', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'other', label: 'Other', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-rose-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'low', label: 'Low', color: 'text-emerald-500' },
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
  return found?.color ?? 'text-zinc-400';
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
      className={`group relative bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-800 transition-all ${
        isDragging ? 'opacity-50 shadow-xl ring-2 ring-emerald-500/50' : ''
      }`}
      onClick={onEdit}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-zinc-300"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      <div className="pl-4">
        {/* Title */}
        <h4 className="text-sm font-medium text-zinc-200 truncate pr-6">{task.title}</h4>

        {/* Type tag + Priority */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTaskTypeStyle(task.task_type)}`}>
            {getTaskTypeLabel(task.task_type)}
          </span>
          {task.priority && (
            <Flag size={12} className={getPriorityColor(task.priority)} fill="currentColor" />
          )}
          {task.is_recurring && <RefreshCw size={12} className="text-purple-400" />}
        </div>

        {/* Due date + Links */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {task.due_date && (
              <span
                className={`text-[10px] flex items-center gap-1 ${
                  dueDateStatus === 'overdue'
                    ? 'text-rose-400'
                    : dueDateStatus === 'soon'
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}
              >
                <Calendar size={10} />
                {formatDueDate(task.due_date)}
              </span>
            )}
          </div>
          {hasLinks && (
            <div className="flex items-center gap-1">
              {task.linked_playbook_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateLink('playbooks', task.linked_playbook_id!);
                  }}
                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
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
                  className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
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
                  className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
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
                  className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition-colors"
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
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

// ==================== TASK CARD (for overlay) ====================

const TaskCardOverlay: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-zinc-800 border border-emerald-500/50 rounded-lg p-3 shadow-2xl w-64">
    <h4 className="text-sm font-medium text-zinc-200 truncate">{task.title}</h4>
    <div className="flex items-center gap-2 mt-2">
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTaskTypeStyle(task.task_type)}`}>
        {getTaskTypeLabel(task.task_type)}
      </span>
      {task.priority && <Flag size={12} className={getPriorityColor(task.priority)} fill="currentColor" />}
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
    <div className="flex flex-col w-72 min-w-[288px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">{column.icon}</span>
          <h3 className="text-sm font-semibold text-zinc-200">{column.label}</h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700/50 rounded-full text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
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
          <div className="flex items-center justify-center h-24 text-zinc-600 text-xs">
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
  const [priority, setPriority] = useState<TaskPriority | ''>(data.task?.priority ?? '');
  const [dueDate, setDueDate] = useState(data.task?.due_date ?? '');
  const [columnId, setColumnId] = useState<TaskColumnId>(data.task?.column_id ?? data.defaultColumn ?? 'backlog');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              placeholder="Task title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
              placeholder="Add details..."
              rows={3}
            />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">None</option>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Column */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Column</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as TaskColumnId)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-zinc-300">Recurring task</span>
            </label>
            {isRecurring && (
              <select
                value={recurringFrequency ?? ''}
                onChange={(e) => setRecurringFrequency((e.target.value || null) as TaskFrequency)}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {isEdit && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
              >
                Delete Task
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || saving}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900/30 to-zinc-900/80 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Complete Task</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-300">
            Completing: <span className="font-medium text-zinc-100">{data.taskTitle}</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Result Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              placeholder="What was the outcome? Any learnings?"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
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
  const { byColumn, loading, error, createTask, updateTask, deleteTask, moveTask, completeTask } = useTasks({
    userId,
  });

  const [taskModal, setTaskModal] = useState<TaskModalData | null>(null);
  const [completionModal, setCompletionModal] = useState<CompletionModalData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

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
      backlog: [],
      this_week: [],
      in_progress: [],
      review: [],
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
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find source column
    const sourceColumn = COLUMNS.find((col) =>
      (byColumn[col.id] ?? []).some((t) => t.id === activeTaskId)
    )?.id;

    if (!sourceColumn) return;

    // Determine target column
    let targetColumn: TaskColumnId = sourceColumn;
    let newIndex = 0;

    // Check if dropped on a column header or empty area
    if (COLUMNS.some((c) => c.id === overId)) {
      targetColumn = overId as TaskColumnId;
      newIndex = (filteredByColumn[targetColumn] ?? []).length;
    } else {
      // Dropped on another task
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
      const task = (byColumn[sourceColumn] ?? []).find((t) => t.id === activeTaskId);
      if (task) {
        setCompletionModal({ taskId: activeTaskId, taskTitle: task.title });
        return;
      }
    }

    await moveTask(activeTaskId, targetColumn, newIndex);
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
          <h1 className="text-2xl font-bold text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your trading workflow</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">All Types</option>
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* New Task Button */}
          <button
            onClick={() => setTaskModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
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


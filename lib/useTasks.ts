import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export type TaskColumnId = 'backlog' | 'this_week' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFrequency = 'weekly' | 'monthly' | null;

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  column_id: TaskColumnId;
  position: number | null;
  priority: TaskPriority | null;
  due_date: string | null;
  task_type: string | null;
  linked_playbook_id: string | null;
  linked_trade_id: string | null;
  linked_journal_id: string | null;
  linked_notebook_id: string | null;
  result_notes: string | null;
  is_recurring: boolean;
  recurring_frequency: TaskFrequency;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
}

export interface UseTasksOptions {
  userId: string | undefined;
}

interface ColumnMap {
  [columnId: string]: Task[];
}

const sortByPosition = (tasks: Task[]) =>
  [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

export const useTasks = ({ userId }: UseTasksOptions) => {
  const [byColumn, setByColumn] = useState<ColumnMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (supaError) {
      setError(supaError.message);
      setLoading(false);
      return;
    }

    const grouped: ColumnMap = {};
    (data as Task[] | null)?.forEach((task) => {
      const col = task.column_id;
      if (!grouped[col]) grouped[col] = [];
      grouped[col].push(task);
    });

    Object.keys(grouped).forEach((col) => {
      grouped[col] = sortByPosition(grouped[col]);
    });

    setByColumn(grouped);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getNextPosition = (columnId: TaskColumnId): number => {
    const columnTasks = byColumn[columnId] ?? [];
    if (!columnTasks.length) return 1;
    const maxPos = Math.max(...columnTasks.map((t) => t.position ?? 0));
    return maxPos + 1;
  };

  const createTask = async (
    partial: Omit<
      Task,
      | 'id'
      | 'user_id'
      | 'created_at'
      | 'updated_at'
      | 'completed_at'
      | 'position'
      | 'is_recurring'
    > & {
      column_id?: TaskColumnId;
      is_recurring?: boolean;
      recurring_frequency?: TaskFrequency;
    }
  ): Promise<Task | null> => {
    if (!userId) return null;
    const column_id = partial.column_id ?? 'backlog';
    const position = getNextPosition(column_id);
    const payload = {
      ...partial,
      user_id: userId,
      column_id,
      position,
      is_recurring: partial.is_recurring ?? false,
      recurring_frequency: partial.recurring_frequency ?? null,
    };

    const { data, error: supaError } = await supabase
      .from('tasks')
      .insert(payload)
      .select('*')
      .single();

    if (supaError) {
      setError(supaError.message);
      return null;
    }

    const task = data as Task;
    setByColumn((prev) => {
      const colTasks = prev[column_id] ? [...prev[column_id], task] : [task];
      return { ...prev, [column_id]: sortByPosition(colTasks) };
    });
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const currentColumn = Object.keys(byColumn).find((col) =>
      (byColumn[col] ?? []).some((task) => task.id === id)
    ) as TaskColumnId | undefined;

    setByColumn((prev) => {
      const next: ColumnMap = {};
      Object.entries(prev).forEach(([colId, tasks]) => {
        let updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
        if (updates.column_id && colId === currentColumn) {
          updatedTasks = updatedTasks.filter((t) => t.id !== id);
        }
        next[colId] = updatedTasks;
      });

      if (updates.column_id) {
        const col = updates.column_id;
        const movedTask = Object.values(prev)
          .flat()
          .find((t) => t.id === id);
        if (movedTask) {
          const targetList = next[col] ?? [];
          next[col] = sortByPosition([
            ...targetList,
            { ...movedTask, ...updates, column_id: col },
          ]);
        }
      }

      return next;
    });

    const { error: supaError } = await supabase.from('tasks').update(updates).eq('id', id);
    if (supaError) {
      setError(supaError.message);
      await loadTasks();
    }
  };

  const deleteTask = async (id: string) => {
    setByColumn((prev) => {
      const next: ColumnMap = {};
      Object.entries(prev).forEach(([colId, tasks]) => {
        next[colId] = tasks.filter((t) => t.id !== id);
      });
      return next;
    });

    const { error: supaError } = await supabase.from('tasks').delete().eq('id', id);
    if (supaError) {
      setError(supaError.message);
      await loadTasks();
    }
  };

  const moveTask = async (
    taskId: string,
    toColumn: TaskColumnId,
    newIndex: number
  ): Promise<void> => {
    const sourceColumn = Object.keys(byColumn).find((col) =>
      (byColumn[col] ?? []).some((task) => task.id === taskId)
    ) as TaskColumnId | undefined;

    if (!sourceColumn) return;

    const task = byColumn[sourceColumn].find((t) => t.id === taskId);
    if (!task) return;

    setByColumn((prev) => {
      const sourceTasks = [...(prev[sourceColumn] ?? [])].filter((t) => t.id !== taskId);
      const targetTasks = sourceColumn === toColumn ? sourceTasks : [...(prev[toColumn] ?? [])];

      targetTasks.splice(newIndex, 0, { ...task, column_id: toColumn });

      const rePos = (tasks: Task[]) =>
        tasks.map((t, idx) => ({
          ...t,
          position: idx + 1,
        }));

      return {
        ...prev,
        [sourceColumn]: rePos(sourceTasks),
        [toColumn]: rePos(targetTasks),
      };
    });

    const targetList = byColumn[toColumn] ?? [];
    const newPosition = newIndex + 1;
    const updates: Partial<Task> = {
      column_id: toColumn,
      position: newPosition,
      updated_at: new Date().toISOString(),
    };

    await updateTask(taskId, updates);
  };

  const completeTask = async (id: string, resultNotes?: string | null) => {
    const allTasks = Object.values(byColumn).flat();
    const task = allTasks.find((t) => t.id === id);
    if (!task) return;

    const completedAt = new Date().toISOString();
    await updateTask(id, {
      column_id: 'completed',
      completed_at: completedAt,
      result_notes: resultNotes ?? task.result_notes,
    });

    if (task.is_recurring) {
      const base: Partial<Task> = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        task_type: task.task_type,
        linked_playbook_id: task.linked_playbook_id,
        linked_trade_id: task.linked_trade_id,
        linked_journal_id: task.linked_journal_id,
        linked_notebook_id: task.linked_notebook_id,
        is_recurring: task.is_recurring,
        recurring_frequency: task.recurring_frequency,
      };

      const defaultColumn: TaskColumnId =
        task.recurring_frequency === 'weekly' ? 'this_week' : 'backlog';

      await createTask({
        ...base,
        column_id: defaultColumn,
      } as any);
    }
  };

  return {
    byColumn,
    loading,
    error,
    reload: loadTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    completeTask,
  };
};



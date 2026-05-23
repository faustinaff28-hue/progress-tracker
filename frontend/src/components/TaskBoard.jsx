import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';

const SortableTaskItem = ({ id, task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-panel p-4 mb-3 cursor-grab active:cursor-grabbing hover:border-neonBlue transition-colors"
    >
      <h4 className="font-semibold text-white">{task.title}</h4>
      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center mt-3 text-xs">
        <span className={`px-2 py-1 rounded-full ${
          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};

const TaskColumn = ({ id, title, tasks }) => {
  return (
    <div className="bg-white/5 rounded-2xl p-4 min-w-[300px] border border-white/5">
      <h3 className="font-bold text-lg mb-4 text-gray-200 border-b border-white/10 pb-2">{title}</h3>
      <SortableContext
        id={id}
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px]">
          {tasks.map(task => (
            <SortableTaskItem key={task.id} id={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const allTasks = res.data;
      setTasks({
        pending: allTasks.filter(t => t.status === 'pending'),
        in_progress: allTasks.filter(t => t.status === 'in_progress'),
        completed: allTasks.filter(t => t.status === 'completed'),
      });
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const activeItem = tasks[activeContainer].find(t => t.id === active.id);
    
    // Optimistic UI update
    setTasks(prev => {
      const activeItems = prev[activeContainer].filter(t => t.id !== active.id);
      const overItems = [...prev[overContainer], { ...activeItem, status: overContainer }];
      
      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });

    // API Call
    try {
      await api.put(`/tasks/${active.id}`, { status: overContainer });
    } catch (err) {
      console.error('Failed to update task status', err);
      fetchTasks(); // Revert on failure
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        <TaskColumn id="pending" title="To Do" tasks={tasks.pending} />
        <TaskColumn id="in_progress" title="In Progress" tasks={tasks.in_progress} />
        <TaskColumn id="completed" title="Done" tasks={tasks.completed} />
      </div>
    </DndContext>
  );
}

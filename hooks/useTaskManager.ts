import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';

const getTasksFromStorage = (userId: string): Task[] => {
    try {
        const storedTasks = localStorage.getItem(`tasks_${userId}`);
        const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
        // Basic validation
        if (Array.isArray(parsedTasks)) {
            return parsedTasks;
        }
        return [];
    } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        return [];
    }
};

const saveTasksToStorage = (userId: string, tasks: Task[]) => {
    try {
        localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
    } catch (e)
        {
        console.error("Failed to save tasks to localStorage", e);
    }
};

export const useTaskManager = (userId: string | undefined) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (userId) {
            setTasks(getTasksFromStorage(userId));
        }
    }, [userId]);

    const updateAndSaveTasks = useCallback((newTasks: Task[] | ((prevTasks: Task[]) => Task[])) => {
        if (userId) {
            setTasks(prevTasks => {
                const updatedTasks = typeof newTasks === 'function' ? newTasks(prevTasks) : newTasks;
                saveTasksToStorage(userId, updatedTasks);
                return updatedTasks;
            });
        }
    }, [userId]);

    const addTask = (title: string) => {
        if (!title.trim()) return;
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            completed: false,
        };
        updateAndSaveTasks(prevTasks => [newTask, ...prevTasks]);
    };

    const toggleTask = (id: string) => {
        updateAndSaveTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (id: string) => {
        updateAndSaveTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };

    const updateTaskTitle = (id: string, newTitle: string) => {
         if (!newTitle.trim()) return;
        updateAndSaveTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, title: newTitle.trim() } : task
            )
        );
    };
    
    const clearCompletedTasks = () => {
        updateAndSaveTasks(prevTasks => prevTasks.filter(task => !task.completed));
    };

    return { tasks, addTask, toggleTask, deleteTask, updateTaskTitle, clearCompletedTasks };
};
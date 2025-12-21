import { useState, useMemo, useEffect } from 'react';
import { useApi } from './useApi';
import { Course, Department, SearchResults, SearchResultItem, BlogPost } from '../types';
import { SEARCHABLE_PAGES } from '../constants';
import { useBlogApi } from './useBlogApi';

export const useSiteSearch = () => {
    const [query, setQuery] = useState('');
    
    const { data: courses, loading: coursesLoading } = useApi<Course[]>('/api/courses');
    const { data: departments, loading: deptsLoading } = useApi<Department[]>('/api/departments');
    const { posts, loading: postsLoading } = useBlogApi();
    
    const isLoading = coursesLoading || deptsLoading || postsLoading;

    const searchableCourses = useMemo((): SearchResultItem[] => {
        if (!courses) return [];
        return courses.map(c => ({
            id: c.id,
            type: 'Course',
            title: `${c.code}: ${c.title}`,
            description: c.description,
            path: '/courses'
        }));
    }, [courses]);

    const searchableDepartments = useMemo((): SearchResultItem[] => {
        if (!departments) return [];
        return departments.map(d => ({
            id: d.id,
            type: 'Department',
            title: d.name,
            description: d.description,
            path: '/departments'
        }));
    }, [departments]);

    const searchableBlogPosts = useMemo((): SearchResultItem[] => {
        if (!posts) return [];
        return posts.map(p => ({
            id: p.id,
            type: 'Blog',
            title: p.title,
            description: p.excerpt,
            path: `/blog/${p.id}`
        }));
    }, [posts]);

    const results: SearchResults | null = useMemo(() => {
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) return null;

        const filterItems = (items: SearchResultItem[]) =>
            items.filter(item =>
                item.title.toLowerCase().includes(trimmedQuery) ||
                item.description.toLowerCase().includes(trimmedQuery)
            );

        return {
            pages: filterItems(SEARCHABLE_PAGES),
            courses: filterItems(searchableCourses),
            departments: filterItems(searchableDepartments),
            blog: filterItems(searchableBlogPosts),
        };
    }, [query, searchableCourses, searchableDepartments, searchableBlogPosts]);
    
    return { query, setQuery, results, isLoading };
};

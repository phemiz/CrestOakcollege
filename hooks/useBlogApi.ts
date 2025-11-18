import { useState, useEffect, useCallback } from 'react';
import { BlogPost, BlogCategory, BlogComment, StaffMember } from '../types';

const BLOG_POSTS_KEY = 'crestview_blog_posts';
const BLOG_CATEGORIES_KEY = 'crestview_blog_categories';

// --- MOCK DATA for initial load ---
const MOCK_CATEGORIES: BlogCategory[] = [
    { id: 'campus-life', name: 'Campus Life' },
    { id: 'academics', name: 'Academics' },
    { id: 'technology', name: 'Technology' },
    { id: 'student-voice', name: 'Student Voice' },
];

const MOCK_INITIAL_POSTS: BlogPost[] = [
    {
        id: 'welcome-to-crestview-innovators',
        title: 'Welcome to the Crestview Innovators Blog!',
        excerpt: 'We are thrilled to launch our new blog, a space for our community to share ideas, stories, and the latest happenings at Crestview College.',
        content: `We are thrilled to launch our new blog, a space for our community to share ideas, stories, and the latest happenings at Crestview College.
        
This platform will feature articles from faculty, students, and alumni on topics ranging from academic breakthroughs to campus events and technological innovations. Our goal is to foster a vibrant digital community that reflects the spirit of excellence and collaboration we cherish.

Stay tuned for our upcoming posts!`,
        authorId: 'staff-admin',
        authorName: 'Dr. Adanna Okoro',
        categoryId: 'campus-life',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
            { id: 'c1', author: 'Jane S.', content: 'This is amazing! Looking forward to reading more.', createdAt: new Date().toISOString() }
        ]
    },
    {
        id: 'embracing-ai-in-health-sciences',
        title: 'Embracing AI in the Health Sciences',
        excerpt: 'The Faculty of Health Science is integrating new AI-powered diagnostic tools into its curriculum, preparing students for the future of healthcare.',
        content: `The Faculty of Health Science is taking a monumental step forward by integrating new AI-powered diagnostic tools into its curriculum. This initiative aims to prepare our students for the future of healthcare, where technology and medicine are increasingly intertwined.

Students in Nursing and Medical Laboratory Science will now have hands-on experience with machine learning models that can help in identifying patterns in medical imaging and lab results, potentially leading to faster and more accurate diagnoses. This practical exposure ensures Crestview graduates remain at the cutting edge of their fields.`,
        authorId: 'staff-academic',
        authorName: 'Prof. Chinua Achebe',
        categoryId: 'academics',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        comments: []
    }
];

// --- Helper Functions ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};

// --- Custom Hook ---
export const useBlogApi = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial data load from localStorage
    useEffect(() => {
        try {
            setLoading(true);
            let storedPosts = getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []);
            if (storedPosts.length === 0) {
                storedPosts = MOCK_INITIAL_POSTS;
                saveToStorage(BLOG_POSTS_KEY, storedPosts);
            }
            setPosts(storedPosts);

            let storedCategories = getFromStorage<BlogCategory[]>(BLOG_CATEGORIES_KEY, []);
            if (storedCategories.length === 0) {
                storedCategories = MOCK_CATEGORIES;
                saveToStorage(BLOG_CATEGORIES_KEY, storedCategories);
            }
            setCategories(storedCategories);
        } catch (e) {
            setError("Failed to load blog data.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshData = useCallback(() => {
        setPosts(getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []));
        setCategories(getFromStorage<BlogCategory[]>(BLOG_CATEGORIES_KEY, []));
    }, []);

    const addPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const slug = postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const allPosts = getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []);
                if (allPosts.some(p => p.id === slug)) {
                    resolve({ success: false, message: 'A post with a similar title already exists.' });
                    return;
                }
                const newPost: BlogPost = {
                    ...postData,
                    id: slug,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                };
                const updatedPosts = [newPost, ...allPosts];
                saveToStorage(BLOG_POSTS_KEY, updatedPosts);
                refreshData();
                resolve({ success: true, message: 'Post created successfully.' });
            }, 200);
        });
    };
    
    const updatePost = async (postId: string, postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'authorId' | 'authorName'>): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const allPosts = getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []);
                const postIndex = allPosts.findIndex(p => p.id === postId);

                if (postIndex === -1) {
                     resolve({ success: false, message: 'Post not found.' });
                     return;
                }

                const updatedPost = {
                    ...allPosts[postIndex],
                    ...postData,
                    updatedAt: new Date().toISOString(),
                };
                
                allPosts[postIndex] = updatedPost;
                saveToStorage(BLOG_POSTS_KEY, allPosts);
                refreshData();
                resolve({ success: true, message: 'Post updated successfully.' });
            }, 200);
        });
    };

    const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
         return new Promise(resolve => {
            setTimeout(() => {
                const allPosts = getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []);
                const updatedPosts = allPosts.filter(p => p.id !== postId);
                saveToStorage(BLOG_POSTS_KEY, updatedPosts);
                refreshData();
                resolve({ success: true, message: 'Post deleted successfully.' });
            }, 200);
        });
    }

    const addComment = async (postId: string, commentData: { author: string; content: string }): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const allPosts = getFromStorage<BlogPost[]>(BLOG_POSTS_KEY, []);
                const postIndex = allPosts.findIndex(p => p.id === postId);
                if (postIndex === -1) {
                    resolve({ success: false, message: 'Post not found.' });
                    return;
                }

                const newComment: BlogComment = {
                    ...commentData,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                };

                allPosts[postIndex].comments.push(newComment);
                saveToStorage(BLOG_POSTS_KEY, allPosts);
                refreshData();
                resolve({ success: true, message: 'Comment added.' });
            }, 200);
        });
    };

    return { posts, categories, loading, error, refreshData, addPost, updatePost, deletePost, addComment };
};

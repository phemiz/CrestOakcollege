import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useBlogApi } from '../hooks/useBlogApi';
import { BlogPost } from '../types';
import { useTheme } from '../hooks/useTheme';

const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const { theme } = useTheme();
    return (
        <article className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} ${theme.card.hover} flex flex-col`}>
            <div className="p-6 flex-grow">
                <p className={`text-sm font-semibold ${theme.accent}`}>{post.authorName}</p>
                <h3 className={`text-xl font-bold ${theme.card.text} mt-1`}>
                    <Link to={`/blog/${post.id}`} className="hover:underline">{post.title}</Link>
                </h3>
                <p className={`${theme.card.textMuted} mt-2 text-sm`}>{post.excerpt}</p>
            </div>
            <div className={`mt-4 pt-4 px-6 pb-6 border-t ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} flex justify-between items-center text-sm`}>
                <p className={theme.textMuted}>{new Date(post.createdAt).toLocaleDateString()}</p>
                <Link to={`/blog/${post.id}`} className={`font-semibold ${theme.accent}`}>Read More &rarr;</Link>
            </div>
        </article>
    );
};

const BlogPage: React.FC = () => {
    const { posts, categories, loading, error } = useBlogApi();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { theme } = useTheme();

    useEffect(() => {
        document.title = 'Blog - Crestview College';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', 'Read the latest articles, news, and insights from the students and faculty at Crestview College.');
        }
    }, []);

    const filteredPosts = useMemo(() => {
        if (selectedCategory === 'all') {
            return posts;
        }
        return posts.filter(post => post.categoryId === selectedCategory);
    }, [posts, selectedCategory]);

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {} as Record<string, string>);
    }, [categories]);

    return (
        <PageWrapper
            title="Crestview Blog"
            subtitle="Insights, stories, and news from our vibrant academic community."
        >
            <div className="max-w-6xl mx-auto">
                {/* Category Filter */}
                <div className="mb-8 flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                         <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selectedCategory === 'all' ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.card.background} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}
                         >
                            All Posts
                         </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selectedCategory === cat.id ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.card.background} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700`}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="text-center" role="status">
                        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.name === 'light' ? 'border-blue-600' : 'border-white'} mx-auto`}></div>
                        <p className={`mt-4 ${theme.textMuted}`}>Loading Posts...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-500">Error loading posts: {error}</p>}
                
                {!loading && !error && (
                    filteredPosts.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className={`text-2xl font-semibold ${theme.text}`}>No Posts Found</h3>
                            <p className={`${theme.textMuted} mt-2`}>There are no blog posts in this category yet. Please check back later!</p>
                        </div>
                    )
                )}
            </div>
        </PageWrapper>
    );
};

export default BlogPage;

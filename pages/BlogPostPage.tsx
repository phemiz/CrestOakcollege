import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useBlogApi } from '../hooks/useBlogApi';
import { BlogPost, BlogComment } from '../types';
import { useTheme } from '../hooks/useTheme';
import NotFoundPage from './NotFoundPage';
import StructuredData from '../components/StructuredData';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { posts, categories, addComment, loading } = useBlogApi();
    const { theme } = useTheme();

    const [commentData, setCommentData] = useState({ author: '', content: '' });
    const [commentStatus, setCommentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [commentError, setCommentError] = useState('');

    const post = useMemo(() => posts.find(p => p.id === slug), [posts, slug]);
    const categoryName = useMemo(() => {
        if (!post) return '';
        const category = categories.find(c => c.id === post.categoryId);
        return category?.name || 'Uncategorized';
    }, [categories, post]);

    useEffect(() => {
        if (post) {
            document.title = `${post.title} - Crestview College`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', post.excerpt);
            }
        } else if (!loading) {
            document.title = 'Post Not Found - Crestview College';
        }
    }, [post, loading]);

    if (loading) {
        return (
            <PageWrapper title="Loading Post...">
                <div className="text-center" role="status">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.name === 'light' ? 'border-blue-600' : 'border-white'} mx-auto`}></div>
                </div>
            </PageWrapper>
        );
    }

    if (!post) {
        return <NotFoundPage />;
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentData.author.trim() || !commentData.content.trim()) {
            setCommentError('Both name and comment are required.');
            return;
        }
        setCommentStatus('loading');
        setCommentError('');
        const result = await addComment(post.id, commentData);
        if (result.success) {
            setCommentStatus('success');
            setCommentData({ author: '', content: '' });
            setTimeout(() => setCommentStatus('idle'), 3000);
        } else {
            setCommentStatus('error');
            setCommentError(result.message || 'Failed to post comment.');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCommentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const cardBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const blogPostSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "author": {
            "@type": "Person",
            "name": post.authorName
        },
        "publisher": {
            "@type": "Organization",
            "name": "Crestview College",
            "logo": {
                "@type": "ImageObject",
                "url": "https://crestview.edu.ng/logo.png"
            }
        },
    };

    return (
        <>
            <StructuredData data={blogPostSchema} id={`blogpost-schema-${post.id}`} />
            <PageWrapper title={post.title}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <p className={`${theme.textMuted}`}>
                            By <span className={`font-semibold ${theme.text}`}>{post.authorName}</span> in <Link to="/blog" className={`font-semibold ${theme.accent} hover:underline`}>{categoryName}</Link>
                        </p>
                        <p className={`${theme.textMuted} text-sm`}>
                            Published on {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className={`prose lg:prose-xl max-w-none ${theme.text} ${theme.textMuted}`} style={{ whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </div>

                    {/* Comments Section */}
                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/20 reader-hidden">
                        <h2 className={`text-3xl font-bold ${theme.text} mb-8`}>Comments ({post.comments.length})</h2>
                        
                        {/* Comment List */}
                        <div className="space-y-6 mb-10">
                            {post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.id} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                            <span className={`text-xl font-bold ${theme.text}`}>{comment.author.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`font-bold ${theme.text}`}>{comment.author}</h4>
                                                <p className={`text-xs ${theme.textMuted}`}>{new Date(comment.createdAt).toLocaleString()}</p>
                                            </div>
                                            <p className={`${theme.textMuted} mt-1`}>{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={theme.textMuted}>Be the first to leave a comment!</p>
                            )}
                        </div>

                        {/* Comment Form */}
                        <div className={`${cardBg} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
                            <h3 className={`text-2xl font-bold ${theme.text} mb-6`}>Leave a Comment</h3>
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="author" className={`block text-sm font-medium ${theme.textMuted}`}>Your Name</label>
                                    <input type="text" name="author" id="author" value={commentData.author} onChange={handleInputChange} className={inputClasses} required />
                                </div>
                                <div>
                                    <label htmlFor="content" className={`block text-sm font-medium ${theme.textMuted}`}>Your Comment</label>
                                    <textarea name="content" id="content" rows={4} value={commentData.content} onChange={handleInputChange} className={inputClasses} required />
                                </div>
                                {commentError && <p className="text-sm text-red-500">{commentError}</p>}
                                {commentStatus === 'success' && <p className="text-sm text-green-500">Your comment has been posted!</p>}
                                <button type="submit" disabled={commentStatus === 'loading'} className={`py-2 px-6 rounded-full font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                                    {commentStatus === 'loading' ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </>
    );
};

export default BlogPostPage;
import { useState, useEffect } from "react";
import LoadingSpinner from "./loading-spinner";

type Post = Readonly<{
    id: number;
    userId: number;
    title: string;
    body: string;
}>;

type Comment = Readonly<{
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}>;

type Author = Readonly<{
    id: number;
    name: string;
    username: string;
    email: string;
}>;

export function PostViewer() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [author, setAuthor] = useState<Author | null>(null);

    // Separate loading states
    const [postsLoading, setPostsLoading] = useState(true);
    const [authorLoading, setAuthorLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            setPostsLoading(true);

            const response = await fetch(
                "https://jsonplaceholder.typicode.com/posts"
            );

            if (!response.ok) {
                throw new Error(`HTTP error! ${response.status}`);
            }

            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setPostsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch author
    useEffect(() => {
        if (!selectedPost) {
            setAuthor(null);
            return;
        }

        setAuthorLoading(true);
        setAuthor(null);

        fetch(
            `https://jsonplaceholder.typicode.com/users/${selectedPost.userId}`
        )
            .then((res) => res.json())
            .then((data: Author) => setAuthor(data))
            .catch((err) => console.error(err))
            .finally(() => setAuthorLoading(false));
    }, [selectedPost]);

    // Fetch comments
    useEffect(() => {
        if (!selectedPost) return;

        setCommentsLoading(true);
        setComments([]);

        fetch(
            `https://jsonplaceholder.typicode.com/posts/${selectedPost.id}/comments`
        )
            .then((r) => r.json())
            .then((data: Comment[]) => setComments(data))
            .catch(console.error)
            .finally(() => setCommentsLoading(false));
    }, [selectedPost?.id]);

    // Initial page loader (only for posts)
    if (postsLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="flex h-screen max-w-7xl mx-auto">
                {/* Sidebar */}
                <div className="w-96 flex flex-col bg-gray-900/50 backdrop-blur-sm border-r border-gray-700">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            📝 Post Explorer
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Discover amazing stories
                        </p>
                    </div>

                    {/* Search */}
                    <div className="p-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Search by title..."
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No posts found
                            </div>
                        ) : (
                            filteredPosts.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPost(p)}
                                    className={`cursor-pointer p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                                        selectedPost?.id === p.id
                                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                                            : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600"
                                    }`}
                                >
                                    <h3 className="text-sm font-semibold text-gray-200 leading-tight line-clamp-2">
                                        <span className="text-blue-400">#{p.id}</span> {p.title}
                                    </h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="flex-1 overflow-y-auto bg-gray-900/30">
                    {!selectedPost ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="text-6xl mb-4">📖</div>
                            <p className="text-lg">Select a post to read</p>
                            <p className="text-sm text-gray-600 mt-2">Click on any post from the list</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto p-8">
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="group mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to list
                            </button>

                            {/* Post Content */}
                            <article className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden backdrop-blur-sm">
                                {/* Post Header */}
                                <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-800/50">
                                    <div className="flex justify-between items-start gap-4 flex-wrap">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-100 leading-tight flex-1">
                                            {selectedPost.title}
                                        </h2>

                                        <div className="bg-gray-900/50 rounded-xl p-3 min-w-[150px]">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                                ✍️ Author
                                            </p>
                                            {authorLoading ? (
                                                <div className="mt-2">
                                                    <LoadingSpinner size="sm" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-blue-400 font-semibold">
                                                        {author?.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        @{author?.username}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Post Body */}
                                <div className="p-6">
                                    <p className="text-gray-300 leading-relaxed">
                                        {selectedPost.body}
                                    </p>
                                </div>
                            </article>

                            {/* Comments Section */}
                            <section className="mt-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <h4 className="text-lg font-semibold text-gray-200">
                                        💬 Comments
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                                        {comments.length}
                                    </span>
                                </div>

                                {commentsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl">
                                        No comments yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment, index) => (
                                            <div
                                                key={comment.id}
                                                className="bg-gray-800/40 hover:bg-gray-800/60 transition-all p-4 rounded-xl border border-gray-700 animate-fade-in"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                    animation: 'fadeInUp 0.3s ease-out forwards',
                                                    opacity: 0
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                                    <span className="font-semibold text-blue-400 text-sm">
                                                        {comment.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        📧 {comment.email}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {comment.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
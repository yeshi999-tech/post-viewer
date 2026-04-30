import { useEffect, useState } from "react";
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
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined") {
            return true;
        }

        const savedTheme = window.localStorage.getItem("theme");
        if (savedTheme === "light") return false;
        if (savedTheme === "dark") return true;

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [author, setAuthor] = useState<Author | null>(null);

    // Separate loading states
    const [postsLoading, setPostsLoading] = useState(true);
    const [authorLoading, setAuthorLoading] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("light", !isDarkMode);
        window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

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
            <div className="flex min-h-[400px] items-center justify-center bg-page">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page">
            <div className="flex h-screen max-w-7xl mx-auto">
                {/* Sidebar */}
                <div className="w-96 flex flex-col bg-surface backdrop-blur-sm border-r border-surface">
                    {/* Header */}
                    <div className="p-4 border-b border-surface bg-surface-strong">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    📝 Post Explorer
                                </h1>
                                <p className="text-xs text-secondary mt-1">
                                    Discover amazing stories
                                </p>
                            </div>

                            <button
                                onClick={() => setIsDarkMode((prev) => !prev)}
                                className="button-surface inline-flex items-center gap-2 rounded-2xl border border-surface px-3 py-2 text-sm font-medium transition"
                                aria-label="Toggle light and dark mode"
                            >
                                {isDarkMode ? "☀️ Light" : "🌙 Dark"} Mode
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Search by title..."
                                className="w-full p-3 input-surface border border-surface rounded-xl text-primary placeholder:text-secondary focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(var(--accent-rgb),0.2)] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-8 text-secondary">
                                No posts found
                            </div>
                        ) : (
                            filteredPosts.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPost(p)}
                                    className={`cursor-pointer p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                                        selectedPost?.id === p.id
                                            ? "bg-accent-soft border border-surface shadow-accent-soft"
                                            : "bg-surface hover:bg-surface-strong border border-surface"
                                    }`}
                                >
                                    <h3 className="text-sm font-semibold text-primary leading-tight line-clamp-2">
                                        <span className="text-accent">#{p.id}</span> {p.title}
                                    </h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="flex-1 overflow-y-auto bg-surface">
                    {!selectedPost ? (
                        <div className="h-full flex flex-col items-center justify-center text-secondary">
                            <div className="text-6xl mb-4">📖</div>
                            <p className="text-lg text-primary">Select a post to read</p>
                            <p className="text-sm text-secondary mt-2">Click on any post from the list</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto p-8">
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="group mb-6 flex items-center gap-2 text-sm text-secondary hover:text-accent transition-colors"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to list
                            </button>

                            {/* Post Content */}
                            <article className="bg-surface rounded-2xl border border-surface overflow-hidden backdrop-blur-sm">
                                {/* Post Header */}
                                <div className="p-6 border-b border-surface bg-surface-strong">
                                    <div className="flex justify-between items-start gap-4 flex-wrap">
                                        <h2 className="text-2xl md:text-3xl font-bold text-primary leading-tight flex-1">
                                            {selectedPost.title}
                                        </h2>

                                        <div className="bg-surface rounded-xl p-3 min-w-[150px]">
                                            <p className="text-xs text-secondary uppercase tracking-wider mb-1">
                                                ✍️ Author
                                            </p>
                                            {authorLoading ? (
                                                <div className="mt-2">
                                                    <LoadingSpinner size="sm" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-accent font-semibold">
                                                        {author?.name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-secondary">
                                                        @{author?.username}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Post Body */}
                                <div className="p-6">
                                    <p className="text-primary leading-relaxed">
                                        {selectedPost.body}
                                    </p>
                                </div>
                            </article>

                            {/* Comments Section */}
                            <section className="mt-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <h4 className="text-lg font-semibold text-primary">
                                        💬 Comments
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-surface rounded-full text-secondary border border-surface">
                                        {comments.length}
                                    </span>
                                </div>

                                {commentsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 text-secondary bg-surface rounded-xl">
                                        No comments yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment, index) => (
                                            <div
                                                key={comment.id}
                                                className="bg-surface hover:bg-surface-strong transition-all p-4 rounded-xl border border-surface animate-fade-in"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                    animation: 'fadeInUp 0.3s ease-out forwards',
                                                    opacity: 0
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                                    <span className="font-semibold text-accent text-sm">
                                                        {comment.name}
                                                    </span>
                                                    <span className="text-xs text-secondary">{comment.email}</span>
                                                </div>
                                                <p className="text-primary text-sm leading-relaxed">
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

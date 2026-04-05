import React, { useEffect, useState } from 'react';
import { Product, ProductAnalysis, useAppStore } from '../store/useAppStore';
import { analyzeProductData } from '../services/gemini';
import { ArrowLeft, Star, MessageSquare, Share2, ThumbsUp, ThumbsDown, Loader2, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { 
    addToHistory, 
    cachedAnalyses, 
    cacheAnalysis, 
    comments, 
    addComment,
    ratings,
    setRating,
    getRating
  } = useAppStore();
  
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');

  const productComments = comments.filter(c => c.productId === product.id).sort((a, b) => b.timestamp - a.timestamp);
  const userRating = getRating(product.id);

  useEffect(() => {
    addToHistory(product);
    
    const fetchAnalysis = async () => {
      if (cachedAnalyses[product.id]) {
        setAnalysis(cachedAnalyses[product.id]);
        return;
      }
      
      setIsAnalyzing(true);
      const result = await analyzeProductData(product.name);
      const fullAnalysis = { ...result, productId: product.id };
      setAnalysis(fullAnalysis);
      cacheAnalysis(product.id, fullAnalysis);
      setIsAnalyzing(false);
    };
    
    fetchAnalysis();
  }, [product.id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${product.name}`,
          text: product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;
    
    addComment({
      productId: product.id,
      text: newComment.trim(),
      author: authorName.trim()
    });
    
    setNewComment('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between sticky top-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to results
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Column: Image & Basic Info */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 mb-6">
            <img 
              src={`https://picsum.photos/seed/${product.imageSeed}/800/800`} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-4">
            {product.category}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-light text-gray-600 dark:text-gray-400 mb-6">{product.price}</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* User Rating */}
          <div className="bg-gray-50 dark:bg-zinc-950 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-medium mb-3">Your Rating</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(product.id, star)}
                  className={`p-1 transition-transform hover:scale-110 ${
                    userRating && star <= userRating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300 dark:text-zinc-700'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-500">
                {userRating ? 'Thanks for rating!' : 'Click to rate'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis & Community */}
        <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col h-full">
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-20">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium">Aggregating real-time data...</p>
              <p className="text-sm mt-2 text-center max-w-xs">Scanning forums, reviews, and retail sites to build a comprehensive analysis.</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8 flex-1">
              {/* Aggregated Stats */}
              <div className="flex items-center gap-6 p-5 bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                    {analysis.aggregatedRating.toFixed(1)} <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Aggregated Score</div>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-zinc-800"></div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    {analysis.sourcesScraped} Sources Analyzed
                  </div>
                  <div className="text-sm text-gray-500 mt-1">From forums, blogs, and retail sites</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                    <ThumbsUp className="w-5 h-5" /> Top Pros
                  </h3>
                  <ul className="space-y-3">
                    {analysis.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
                    <ThumbsDown className="w-5 h-5" /> Top Cons
                  </h3>
                  <ul className="space-y-3">
                    {analysis.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sentiment */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" /> Community Consensus
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  {analysis.sentiment}
                </p>
              </div>
            </div>
          ) : null}

          {/* Comments Section */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-zinc-800">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              Discussion ({productComments.length})
            </h3>
            
            <form onSubmit={handleCommentSubmit} className="mb-8 space-y-3">
              <input 
                type="text"
                placeholder="Your Name"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                required
              />
              <textarea 
                placeholder="Share your thoughts or ask a question..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[100px] resize-y"
                required
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Post Comment
              </button>
            </form>

            <div className="space-y-4">
              {productComments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                productComments.map(comment => (
                  <div key={comment.id} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

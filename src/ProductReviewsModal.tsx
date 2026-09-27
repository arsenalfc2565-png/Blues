import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  MapPin,
  Building,
  TrendingUp,
  Filter,
  Plus,
  ArrowRight,
  Truck,
  Award,
  Clock,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Product, ProductReview } from '../types';

interface ProductReviewsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'productId' | 'reviewDate'>) => void;
  onHelpfulVote?: (productId: string, reviewId: string) => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddReview,
  onHelpfulVote,
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');

  // Form State
  const [resellerName, setResellerName] = useState('');
  const [resellerLocation, setResellerLocation] = useState('Kisumu County (Kibuye Market)');
  const [businessType, setBusinessType] = useState<ProductReview['businessType']>('Physical Boutique');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [orderNumberRef, setOrderNumberRef] = useState('');
  const [pairsPurchased, setPairsPurchased] = useState<number>(24);
  const [turnoverSpeed, setTurnoverSpeed] = useState('Sold out within 1 week');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Helpful state track
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const reviewsList = product.reviews || [];
  const totalReviewsCount = reviewsList.length;
  
  // Calculate average rating
  const averageRating = totalReviewsCount > 0
    ? Math.round((reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount) * 10) / 10
    : (product.rating || 4.9);

  // Calculate rating distributions
  const ratingCounts = {
    5: reviewsList.filter((r) => r.rating === 5).length,
    4: reviewsList.filter((r) => r.rating === 4).length,
    3: reviewsList.filter((r) => r.rating === 3).length,
    2: reviewsList.filter((r) => r.rating === 2).length,
    1: reviewsList.filter((r) => r.rating === 1).length,
  };

  // Filtered & Sorted reviews
  const filteredReviews = reviewsList
    .filter((rev) => {
      if (filterRating === 'all') return true;
      if (filterRating === 'verified') return rev.verifiedPurchase;
      return rev.rating === Number(filterRating);
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerName.trim() || !comment.trim()) {
      setReviewError('Please fill in your Reseller Name and review comments.');
      return;
    }
    setReviewError(null);

    onAddReview(product.id, {
      resellerName: resellerName.trim(),
      resellerLocation: resellerLocation.trim(),
      businessType,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      verifiedPurchase: true,
      pairsPurchased,
      turnoverSpeed,
      orderNumberRef: orderNumberRef.trim() || undefined,
      helpfulCount: 0,
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setActiveTab('reviews');
      // Reset form
      setResellerName('');
      setTitle('');
      setComment('');
      setOrderNumberRef('');
    }, 1800);
  };

  const handleVoteHelpful = (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;
    setVotedReviews((prev) => new Set(prev).add(reviewId));
    if (onHelpfulVote) {
      onHelpfulVote(product.id, reviewId);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-4xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-blue-900/90 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified B2B Reseller Community</span>
                </span>
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white truncate max-w-md">
                {product.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-100/90 border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reseller Reviews ({totalReviewsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Write Reseller Review</span>
            </button>
          </div>

          {/* Quick Average Rating Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <span className="font-display font-black text-sm text-amber-950">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              / 5.0 ({totalReviewsCount} reviews)
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {activeTab === 'reviews' ? (
            <div className="space-y-6">
              {/* Trust & Rating Summary Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-3xl bg-neutral-50 border border-neutral-200 shadow-2xs">
                {/* Left: Overall Score */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-neutral-200/80 text-center shadow-xs">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Community Reseller Score
                  </span>
                  <div className="text-4xl font-black font-display text-neutral-900 mt-1">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 my-1.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-600 font-medium">
                    Based on <strong>{totalReviewsCount} verified Kenyan wholesale orders</strong>
                  </span>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Genuine Landed Quality</span>
                  </div>
                </div>

                {/* Middle: Star Breakdown Distribution */}
                <div className="md:col-span-5 flex flex-col justify-center space-y-2 p-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
                    const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-neutral-600 font-medium flex items-center gap-0.5 shrink-0">
                          <span>{stars}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[11px] font-mono text-neutral-500 shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Reseller Trust Metrics */}
                <div className="md:col-span-3 flex flex-col justify-center gap-2.5 p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-950 text-xs">Bus Parcel Tested</h4>
                      <p className="text-[10px] text-blue-800 leading-tight">
                        Tested via Easy Coach & Guardian Angel parcels across 47 counties.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-950 text-xs">High Turnover Rate</h4>
                      <p className="text-[10px] text-blue-800 leading-tight">
                        Resellers report 4-7 day average retail shelf clearance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter and Sort Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-neutral-500 font-semibold text-[11px] flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Filter:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterRating('all')}
                    className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                      filterRating === 'all'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    All ({totalReviewsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRating('5')}
                    className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                      filterRating === '5'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span>5 Stars</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRating('4')}
                    className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                      filterRating === '4'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span>4 Stars</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRating('verified')}
                    className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                      filterRating === 'verified'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <UserCheck className="w-3 h-3 text-emerald-500" />
                    <span>Verified Only</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3">
                  <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto" />
                  <h4 className="font-bold text-neutral-800 text-sm">No reviews match your filter</h4>
                  <p className="text-neutral-500 text-xs">
                    Be the first verified boutique owner or merchant to review this footwear model!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((rev) => {
                    const isVoted = votedReviews.has(rev.id);
                    const currentHelpful = (rev.helpfulCount || 0) + (isVoted ? 1 : 0);

                    return (
                      <div
                        key={rev.id}
                        className="p-5 rounded-3xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all shadow-xs space-y-3"
                      >
                        {/* Review Header: User & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center font-display text-sm shrink-0">
                              {rev.resellerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                                  {rev.resellerName}
                                </span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Reseller</span>
                                  </span>
                                )}
                                {rev.businessType && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-medium">
                                    <Building className="w-2.5 h-2.5 text-neutral-500" />
                                    <span>{rev.businessType}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-neutral-400" />
                                  <span>{rev.resellerLocation}</span>
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  <span>{rev.reviewDate}</span>
                                </span>
                                {rev.orderNumberRef && (
                                  <>
                                    <span>·</span>
                                    <span className="font-mono text-[10px] text-neutral-400">
                                      Ref: {rev.orderNumberRef}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Star Rating Display */}
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-neutral-300'
                                }`}
                              />
                            ))}
                            <span className="font-bold text-amber-950 text-xs ml-1 font-mono">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>

                        {/* Badges Strip: Pairs & Turnover */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          {rev.pairsPurchased && (
                            <span className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3 text-blue-600" />
                              <span>Order: {rev.pairsPurchased} Pairs</span>
                            </span>
                          )}
                          {rev.turnoverSpeed && (
                            <span className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-purple-600" />
                              <span>{rev.turnoverSpeed}</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Comment */}
                        <div className="space-y-1.5">
                          {rev.title && (
                            <h4 className="font-bold text-neutral-900 text-sm">
                              &ldquo;{rev.title}&rdquo;
                            </h4>
                          )}
                          <p className="text-neutral-700 leading-relaxed text-xs">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Depot Reply (if present) */}
                        {rev.replyFromDepot && (
                          <div className="p-3 bg-neutral-50 rounded-2xl border-l-4 border-blue-600 space-y-1 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>{rev.replyFromDepot.author}</span>
                              <span className="text-neutral-400 font-normal">
                                · {rev.replyFromDepot.date}
                              </span>
                            </div>
                            <p className="text-neutral-600 italic">
                              &ldquo;{rev.replyFromDepot.message}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Bottom Actions: Helpful vote */}
                        <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-500">
                          <span>Was this reseller insight helpful to you?</span>
                          <button
                            type="button"
                            onClick={() => handleVoteHelpful(rev.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                              isVoted
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-600 text-emerald-600' : 'text-neutral-400'}`} />
                            <span>Helpful ({currentHelpful})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Write a Review Tab Form */
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-950 text-xs">
                    Share Genuine Feedback for the Kenyan Reseller Community
                  </h4>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    Your experience helps fellow boutique owners and merchants across Kisumu, Eldoret, Nakuru, and Kakamega make informed bulk inventory choices.
                  </p>
                </div>
              </div>

              {isSubmittedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Review Submitted Successfully!</h4>
                    <p className="text-xs text-emerald-800">
                      Your verified review is now live in the Blues Collection community hub.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
                {/* 1. Star Rating Selector */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-center">
                  <label className="font-bold text-neutral-800 block text-xs">
                    Overall Footwear Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-950 font-display">
                    {rating === 5 && '⭐⭐⭐⭐⭐ 5.0 - Exceptional Profit & Turnover'}
                    {rating === 4 && '⭐⭐⭐⭐ 4.0 - High Quality & Fast Resale'}
                    {rating === 3 && '⭐⭐⭐ 3.0 - Satisfactory / Standard Demand'}
                    {rating === 2 && '⭐⭐ 2.0 - Slower Customer Turnover'}
                    {rating === 1 && '⭐ 1.0 - Issues Encountered'}
                  </span>
                </div>

                {/* 2. Reseller Name & Business Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Reseller / Boutique Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resellerName}
                      onChange={(e) => setResellerName(e.target.value)}
                      placeholder="e.g. Mama Stacy Shoes / Brenda Chebet"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Physical Boutique">Physical Shoe Boutique</option>
                      <option value="Wholesale Carton Merchant">Wholesale Carton Merchant</option>
                      <option value="WhatsApp / Instagram Vendor">WhatsApp / Instagram Vendor</option>
                      <option value="Open Air Market Stall">Open Air Market Merchant (Kibuye / Kongowea / Gikomba)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Town / County Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Reseller Town / County <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resellerLocation}
                      onChange={(e) => setResellerLocation(e.target.value)}
                      placeholder="e.g. Uasin Gishu (Eldoret CBD & Uganda Rd)"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Order / Waybill Ref <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={orderNumberRef}
                      onChange={(e) => setOrderNumberRef(e.target.value)}
                      placeholder="e.g. BC-2026-9104 or GA-84012"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Pairs Purchased & Turnover Speed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Pairs Purchased in Batch
                    </label>
                    <input
                      type="number"
                      min={2}
                      value={pairsPurchased}
                      onChange={(e) => setPairsPurchased(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Turnover & Clearance Speed
                    </label>
                    <select
                      value={turnoverSpeed}
                      onChange={(e) => setTurnoverSpeed(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Sold out within 3 days (Instant hit)">Sold out within 3 days (Instant hit)</option>
                      <option value="Sold out within 1 week">Sold out within 1 week</option>
                      <option value="Steady 2-week turnover">Steady 2-week turnover</option>
                      <option value="High weekend church & wedding surge">High weekend church & wedding surge</option>
                    </select>
                  </div>
                </div>

                {/* 5. Review Title & Comment */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fast turnover in Kakamega! Clients love the heel stability."
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Detailed Reseller Experience & Customer Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how this shoe performed with your retail customers, sizing accuracy, build quality, and resale margin..."
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-700/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Verified Review</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

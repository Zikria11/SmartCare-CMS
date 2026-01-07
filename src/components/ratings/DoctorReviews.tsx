import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, User, ThumbsUp, MessageCircle, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Review {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  date: Date;
  appointmentId?: string;
  helpfulCount: number;
  isHelpful?: boolean;
  tags?: string[]; // e.g., ['punctual', 'knowledgeable', 'friendly']
}

interface DoctorReviewsProps {
  doctorId?: string;
  patientId?: string; // If provided, user can leave a review
  onReviewSubmit?: (review: Omit<Review, 'id' | 'patientId' | 'date' | 'helpfulCount' | 'isHelpful' | 'patientName' | 'patientAvatar'>) => void;
}

const DoctorReviews: React.FC<DoctorReviewsProps> = ({ 
  doctorId, 
  patientId, 
  onReviewSubmit 
}) => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      patientId: 'patient1',
      patientName: 'John Doe',
      doctorId: 'doctor1',
      rating: 5,
      title: 'Excellent doctor with great bedside manner',
      comment: 'Dr. Smith was very thorough and took the time to explain everything. I felt heard and well taken care of during my visit.',
      date: new Date('2024-12-10'),
      helpfulCount: 12,
      tags: ['knowledgeable', 'friendly', 'thorough']
    },
    {
      id: '2',
      patientId: 'patient2',
      patientName: 'Jane Smith',
      doctorId: 'doctor1',
      rating: 4,
      title: 'Professional and caring',
      comment: 'Very professional doctor who made me feel comfortable. The wait time was reasonable and the consultation was comprehensive.',
      date: new Date('2024-11-25'),
      helpfulCount: 8,
      tags: ['professional', 'punctual']
    },
    {
      id: '3',
      patientId: 'patient3',
      patientName: 'Robert Johnson',
      doctorId: 'doctor1',
      rating: 5,
      title: 'Outstanding care',
      comment: 'Dr. Smith has been my doctor for years and consistently provides excellent care. Highly recommend!',
      date: new Date('2024-10-15'),
      helpfulCount: 15,
      tags: ['experienced', 'trustworthy']
    }
  ]);
  
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    tags: [] as string[]
  });
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortOption, setSortOption] = useState<'newest' | 'highest' | 'mostHelpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Initialize with sample data
  useEffect(() => {
    if (doctorId) {
      // In a real app, this would fetch from the backend
    }
  }, [doctorId]);

  const handleStarClick = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleTagClick = (tag: string) => {
    setNewReview(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || !newReview.title || !newReview.comment || !patientId) return;

    const review: Omit<Review, 'id' | 'patientId' | 'date' | 'helpfulCount' | 'isHelpful' | 'patientName' | 'patientAvatar'> = {
      doctorId: doctorId || '',
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      appointmentId: '', // Would be linked to an appointment in a real app
      tags: newReview.tags
    };

    if (onReviewSubmit) {
      onReviewSubmit(review);
    }

    // Reset form
    setNewReview({ rating: 0, title: '', comment: '', tags: [] });
    setShowReviewForm(false);
  };

  const handleHelpfulClick = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            helpfulCount: review.helpfulCount + 1,
            isHelpful: true
          } 
        : review
    ));
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === 'highest') {
      return b.rating - a.rating;
    } else if (sortOption === 'mostHelpful') {
      return b.helpfulCount - a.helpfulCount;
    }
    return 0;
  });

  const filteredReviews = filterRating 
    ? sortedReviews.filter(review => review.rating === filterRating)
    : sortedReviews;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Doctor Ratings & Reviews
          </CardTitle>
          <CardDescription>
            What patients are saying about this doctor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {reviews.length} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <div className="w-8 text-sm">{rating}</div>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="mostHelpful">Most Helpful</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {patientId && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            <Star className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && patientId && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>
              Share your experience with this doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2">Rating</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2">Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                  placeholder="Brief summary of your experience"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-2">Your Review</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Describe your experience with the doctor..."
                  rows={4}
                />
              </div>

              <div>
                <div className="mb-2">Tags (Select all that apply)</div>
                <div className="flex flex-wrap gap-2">
                  {['Knowledgeable', 'Friendly', 'Punctual', 'Thorough', 'Professional', 'Caring'].map(tag => (
                    <Badge
                      key={tag}
                      variant={newReview.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} disabled={newReview.rating === 0 || !newReview.title || !newReview.comment}>
                  Submit Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 0, title: '', comment: '', tags: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No reviews yet</p>
              <p className="text-sm">Be the first to review this doctor</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {review.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.patientName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="font-semibold mt-1">{review.title}</h3>
                      <p className="text-muted-foreground mt-1">{review.comment}</p>
                      
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {review.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulClick(review.id)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className={`w-4 h-4 ${review.isHelpful ? 'text-blue-500 fill-current' : ''}`} />
                    <span className="ml-1">{review.helpfulCount}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorReviews;
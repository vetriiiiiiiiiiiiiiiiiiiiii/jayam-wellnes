const prisma = require('../config/prisma');
const { serializeReview } = require('../utils/serialize');

// Fetch all reviews for admin dashboard
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      // Include product info to display what they reviewed
      include: {
        product: {
          select: { id: true, name: true, images: { orderBy: { position: 'asc' } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reviews.map(serializeReview)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Update a review (e.g., moderate content, change rating)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating, author } = req.body;

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        title,
        content,
        rating: rating !== undefined ? Number(rating) : undefined,
        author
      }
    });

    res.json({ success: true, data: serializeReview(updatedReview), message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review (moderation)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = await prisma.review.deleteMany({ where: { id } });

    if (count === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

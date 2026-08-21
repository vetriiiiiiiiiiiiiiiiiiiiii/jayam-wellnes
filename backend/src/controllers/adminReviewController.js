const Review = require('../models/reviewModel');

// Fetch all reviews for admin dashboard
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name images') // Populate product info to display what they reviewed
      .sort({ createdAt: -1 });
    
    // Map _id to id for frontend
    res.json({
      success: true,
      data: reviews.map(r => {
        const obj = r.toObject();
        obj.id = obj._id.toString();
        // If product populated, map its id too
        if (obj.productId && obj.productId._id) {
          obj.productId.id = obj.productId._id.toString();
        }
        return obj;
      })
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

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { title, content, rating, author },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const obj = updatedReview.toObject();
    obj.id = obj._id.toString();

    res.json({ success: true, data: obj, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review (moderation)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    
    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

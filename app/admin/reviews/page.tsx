import prisma from "@/lib/db";
import { format } from "date-fns";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      product: true,
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900">Reviews</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No reviews yet.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Rating</th>
                <th className="px-6 py-4 font-medium text-gray-900">Product</th>
                <th className="px-6 py-4 font-medium text-gray-900">Customer</th>
                <th className="px-6 py-4 font-medium text-gray-900">Content</th>
                <th className="px-6 py-4 font-medium text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-brand-green-500 font-medium">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{review.product.name}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {review.user?.name || "Guest"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {review.content}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

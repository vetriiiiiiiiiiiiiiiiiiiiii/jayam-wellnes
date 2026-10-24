import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminEnquiries, updateAdminEnquiryStatus } from '../../services/api';
import { ENQUIRY_CATEGORIES } from '../../lib/store';

const categoryLabel = (value) => ENQUIRY_CATEGORIES.find((category) => category.value === value)?.label || value;
const STATUSES = ['NEW', 'RESPONDED', 'CLOSED'];

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    const res = await getAdminEnquiries(filter);
    if (res.success) setEnquiries(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, [filter]);

  const changeStatus = async (id, status) => {
    const res = await updateAdminEnquiryStatus(id, status);
    if (res.success) {
      setSelected((current) => (current?.id === id ? { ...current, status } : current));
      fetchEnquiries();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
        <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block text-gray-500 hover:text-brand-dark transition-colors">Dashboard</Link>
          <Link to="/admin/orders" className="block text-gray-500 hover:text-brand-dark transition-colors">Orders</Link>
          <Link to="/admin/products" className="block text-gray-500 hover:text-brand-dark transition-colors">Products</Link>
          <Link to="/admin/users" className="block text-gray-500 hover:text-brand-dark transition-colors">Users</Link>
          <Link to="/admin/reviews" className="block text-gray-500 hover:text-brand-dark transition-colors">Reviews</Link>
          <Link to="/admin/enquiries" className="block text-brand-dark font-bold transition-colors">Enquiries</Link>
          <Link to="/admin/content" className="block text-gray-500 hover:text-brand-dark transition-colors">Site content</Link>
        </nav>
      </div>

      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-serif text-gray-900">Customer Enquiries</h1>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : enquiries.length === 0 ? (
          <p className="text-gray-500">No enquiries yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500">Received</th>
                    <th className="px-6 py-4 font-medium text-gray-500">From</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Topic</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Subject</th>
                    <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id} onClick={() => setSelected(enquiry)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(enquiry.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-900">{enquiry.name}<div className="text-xs text-gray-500">{enquiry.email}</div></td>
                      <td className="px-6 py-4 text-gray-500">{categoryLabel(enquiry.category)}</td>
                      <td className="px-6 py-4 text-gray-900">{enquiry.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${enquiry.status === 'NEW' ? 'bg-amber-100 text-amber-800' : enquiry.status === 'RESPONDED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{enquiry.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{categoryLabel(selected.category)} · {new Date(selected.createdAt).toLocaleString()}</p>
            <h2 className="text-2xl font-serif mb-4">{selected.subject}</h2>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm mb-6">
              <dt className="text-gray-500">Name</dt><dd>{selected.name}</dd>
              <dt className="text-gray-500">Email</dt><dd><a className="underline" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>{selected.email}</a></dd>
              {selected.phone && <><dt className="text-gray-500">Phone</dt><dd>{selected.phone}</dd></>}
              {selected.orderNumber && <><dt className="text-gray-500">Order</dt><dd>{selected.orderNumber}</dd></>}
            </dl>
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed border-t pt-4 mb-6">{selected.message}</p>
            <div className="flex flex-wrap gap-3">
              {STATUSES.map((status) => (
                <button key={status} type="button" disabled={selected.status === status} onClick={() => changeStatus(selected.id, status)} className="px-4 py-2 border rounded text-xs uppercase tracking-wider disabled:bg-gray-900 disabled:text-white">
                  {status === 'NEW' ? 'Mark new' : status === 'RESPONDED' ? 'Mark responded' : 'Close'}
                </button>
              ))}
              <button type="button" onClick={() => setSelected(null)} className="ml-auto px-4 py-2 text-xs uppercase tracking-wider text-gray-500">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

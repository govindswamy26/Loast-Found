import React, { useState, useEffect } from 'react';
import { useItems } from '../context/ItemsContext';
import { toast } from 'react-hot-toast';

export function ModeratorDashboard() {
  const { state, getItemsByStatus, updateItemStatus, deleteItem } = useItems();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allItemsLoading, setAllItemsLoading] = useState(false);

  const approvedItems = getItemsByStatus('Approved');
  const claimedItems = getItemsByStatus('Claimed');

  const handleApprove = async (itemId) => {
    try {
      const res = await fetch(`/api/moderator/approve/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        toast.success('Item approved successfully!');
        setPendingItems(prev => prev.filter(item => item.id !== itemId));
        setAllItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'Approved' }
            : item
        ));
      } else {
        toast.error('Failed to approve item');
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (itemId) => {
    try {
      const res = await fetch(`/api/moderator/reject/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        toast.success('Item rejected successfully!');
        setPendingItems(prev => prev.filter(item => item.id !== itemId));
        setAllItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'Rejected' }
            : item
        ));
      } else {
        toast.error('Failed to reject item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };

  // Fetch pending items from backend
  useEffect(() => {
    const fetchPendingItems = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/moderator/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((i) => ({
            id: i._id,
            title: i.title,
            description: i.description,
            category: i.category,
            dateReported: i.dateReported,
            location: i.location,
            status: i.status,
            reportedBy: i.reportedBy?._id,
            reportedByName: i.reportedBy?.name,
            claimantId: i.claimantId,
            claimantName: i.claimantId?.name,
            claimDate: i.claimDate,
            approvedBy: i.approvedBy,
          }));
          setPendingItems(normalized);
        }
      } catch (error) {
        console.error('Error fetching pending items:', error);
        toast.error('Failed to load pending items');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, []);

  // Fetch all items for moderator dashboard (including claimed items)
  const [allItems, setAllItems] = useState([]);
  
  useEffect(() => {
    const fetchAllItems = async () => {
      setAllItemsLoading(true);
      try {
        const res = await fetch('/api/items', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map((i) => ({
            id: i._id,
            title: i.title,
            description: i.description,
            category: i.category,
            dateReported: i.dateReported,
            location: i.location,
            status: i.status,
            reportedBy: i.reportedBy?._id,
            reportedByName: i.reportedBy?.name,
            claimantId: i.claimantId,
            claimantName: i.claimantId?.name,
            claimDate: i.claimDate,
            approvedBy: i.approvedBy,
          }));
          setAllItems(normalized);
        }
      } catch (error) {
        console.error('Error fetching all items:', error);
        toast.error('Failed to load items');
      } finally {
        setAllItemsLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  const stats = {
    pending: pendingItems.length,
    approved: allItems.filter(item => item.status === 'Approved').length,
    claimed: allItems.filter(item => item.status === 'Claimed').length,
    total: allItems.length,
  };

  // Moderator item card component
  const ModeratorItemCard = ({ item }) => {
    return (
      <div className="border p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
        <p className="mb-2">{item.description}</p>
        
        <div className="text-sm text-gray-600 mb-2">
          <div>Category: {item.category}</div>
          <div>Status: {item.status}</div>
          <div>Date: {new Date(item.dateReported).toLocaleDateString()}</div>
          <div>Location: {item.location}</div>
          <div>Posted by: {item.reportedByName}</div>
          {item.claimDate && <div>Claimed on: {new Date(item.claimDate).toLocaleDateString()}</div>}
          {item.claimantName && <div>Claimed by: {item.claimantName}</div>}
        </div>

        {item.status === 'Pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleApprove(item.id)}
              className="bg-green-600 text-white py-2 px-4 rounded-md"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(item.id)}
              className="bg-red-600 text-white py-2 px-4 rounded-md"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>

      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="border p-4 text-center">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm">Pending</div>
          </div>
          <div className="border p-4 text-center">
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-sm">Approved</div>
          </div>
          <div className="border p-4 text-center">
            <div className="text-2xl font-bold">{stats.claimed}</div>
            <div className="text-sm">Claimed</div>
          </div>
          <div className="border p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm">Total</div>
          </div>
        </div>
      </div>

      <div className="border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 ${activeTab === 'pending' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-4 ${activeTab === 'approved' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`px-6 py-4 ${activeTab === 'claimed' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
            >
              Claimed ({stats.claimed})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 ${activeTab === 'analytics' ? 'bg-blue-50 border-b-2 border-blue-500' : ''}`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading pending items...</p>
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="text-center py-8">
                  <p>No pending items</p>
                </div>
              ) : (
                <div>
                  {pendingItems.map(item => (
                    <ModeratorItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              {allItemsLoading ? (
                <div className="text-center py-8">
                  <p>Loading approved items...</p>
                </div>
              ) : allItems.filter(item => item.status === 'Approved').length === 0 ? (
                <div className="text-center py-8">
                  <p>No approved items</p>
                </div>
              ) : (
                <div>
                  {allItems.filter(item => item.status === 'Approved').map(item => (
                    <ModeratorItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'claimed' && (
            <div>
              {allItemsLoading ? (
                <div className="text-center py-8">
                  <p>Loading claimed items...</p>
                </div>
              ) : allItems.filter(item => item.status === 'Claimed').length === 0 ? (
                <div className="text-center py-8">
                  <p>No claimed items</p>
                </div>
              ) : (
                <div>
                  {allItems.filter(item => item.status === 'Claimed').map(item => (
                    <ModeratorItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="border p-4 text-center">
                <h3 className="font-semibold mb-2">Success Rate</h3>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.claimed / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm">Items successfully reunited</p>
              </div>

              <div className="border p-4 text-center">
                <h3 className="font-semibold mb-2">Lost vs Found</h3>
                <div>
                  <div>Lost: {allItems.filter(i => i.category === 'lost').length}</div>
                  <div>Found: {allItems.filter(i => i.category === 'found').length}</div>
                </div>
              </div>

              <div className="border p-4 text-center">
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <p className="text-2xl font-bold">
                  {allItems.filter(item => {
                    const itemDate = new Date(item.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return itemDate > weekAgo;
                  }).length}
                </p>
                <p className="text-sm">Items this week</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

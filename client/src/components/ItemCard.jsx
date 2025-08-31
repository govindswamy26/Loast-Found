import React from 'react';
import { Calendar, MapPin, User, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export function ItemCard({ item, showActions = false }) {
  const { state } = useAuth();
  const { updateItemStatus } = useItems();

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Claimed: 'bg-gray-100 text-gray-800 border-gray-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      lost: 'bg-red-100 text-red-800 border-red-200',
      found: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[category];
  };

  const handleClaim = () => {
    if (state.user) {
      updateItemStatus(item.id, 'Claimed');
    }
  };

  const canClaim =
    item.status === 'Approved' &&
    item.reportedBy !== state.user?.id &&
    state.isAuthenticated;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">
            {item.title}
          </h3>
          <div className="flex space-x-2 ml-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryBadge(
                item.category
              )}`}
            >
              {item.category.toUpperCase()}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(item.dateReported).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{item.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2" />
            <span>Posted by {item.reportedByName}</span>
          </div>

          {item.status === 'Claimed' && item.claimDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="w-4 h-4 mr-2" />
              <span>Claimed on {new Date(item.claimDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {canClaim && (
          <button
            onClick={handleClaim}
            className="w-full bg-hero text-white py-2 px-4 rounded-md hover:bg-bgmain transition-colors font-medium"
          >
            Claim This Item
          </button>
        )}

        {!state.isAuthenticated && item.status === 'Approved' && (
          <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center">
            Login to claim this item
          </div>
        )}
      </div>
    </div>
  );
}

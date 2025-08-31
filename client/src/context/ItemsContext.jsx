import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const initialState = {
  items: [],
  loading: false,
};

const API_BASE = '/api';

const ItemsContext = createContext({
  state: initialState,
  addItem: () => {},
  updateItemStatus: () => {},
  deleteItem: () => {},
  getItemsByStatus: () => [],
  getApprovedItems: () => [],
});

function itemsReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

export function ItemsProvider({ children }) {
  const [state, dispatch] = useReducer(itemsReducer, initialState);
  const { state: auth } = useAuth();

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const res = await fetch(`${API_BASE}/items/approved`);
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
        dispatch({ type: 'SET_ITEMS', payload: normalized });
      } catch (e) {
        console.error('Error loading items:', e);
        toast.error('Failed to load items. Please refresh the page.');
        dispatch({ type: 'SET_ITEMS', payload: [] });
      }
    };
    fetchApproved();
  }, []);

  const addItem = async (itemData) => {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
        },
        body: JSON.stringify({
          title: itemData.title,
          description: itemData.description,
          category: itemData.category,
          location: itemData.location,
          dateReported: itemData.date,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const saved = await res.json();
      const normalized = {
        id: saved._id,
        title: saved.title,
        description: saved.description,
        category: saved.category,
        dateReported: saved.dateReported,
        location: saved.location,
        status: saved.status,
        reportedBy: saved.reportedBy,
        reportedByName: undefined,
        claimantId: saved.claimantId,
        claimantName: saved.claimantId?.name,
        claimDate: saved.claimDate,
        approvedBy: saved.approvedBy,
      };
      dispatch({ type: 'ADD_ITEM', payload: normalized });
      toast.success('Item submitted successfully! Waiting for moderator approval.');
    } catch (e) {
      console.error('Error submitting item:', e);
      toast.error('Failed to submit item. Please try again.');
    }
  };

  const updateItemStatus = async (itemId, status) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      if (status === 'Approved' || status === 'Rejected' || status === 'Pending') {
        const res = await fetch(`${API_BASE}/items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
          },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed');
        const updated = await res.json();
        dispatch({
          type: 'UPDATE_ITEM',
          payload: {
            ...item,
            status: updated.status,
            approvedBy: updated.approvedBy,
          },
        });
      } else if (status === 'Claimed') {
        const res = await fetch(`${API_BASE}/items/${itemId}/claim`, {
          method: 'POST',
          headers: {
            Authorization: auth.token ? `Bearer ${auth.token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Failed');
        const result = await res.json();
        dispatch({
          type: 'UPDATE_ITEM',
          payload: { 
            ...item, 
            status: 'Claimed',
            claimantId: result.item?.claimantId,
            claimantName: result.item?.claimantId?.name,
            claimDate: result.item?.claimDate
          },
        });
      }
      if (status === 'Approved') toast.success(`Item "${item.title}" has been approved!`);
      if (status === 'Claimed') toast.success(`Item "${item.title}" has been claimed!`);
      if (status === 'Rejected') toast.error(`Item "${item.title}" has been rejected.`);
    } catch (e) {
      console.error('Error updating item:', e);
      toast.error('Failed to update item. Please try again.');
    }
  };

  const deleteItem = async (itemId) => {
    const item = state.items.find((i) => i.id === itemId);
    try {
      const res = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: auth.token ? `Bearer ${auth.token}` : undefined },
      });
      if (!res.ok) throw new Error('Failed');
      dispatch({ type: 'DELETE_ITEM', payload: itemId });
      if (item) toast.success(`Item "${item.title}" has been deleted.`);
    } catch (e) {
      console.error('Error deleting item:', e);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const getItemsByStatus = (status) => {
    return state.items.filter((item) => item.status === status);
  };

  const getApprovedItems = () => {
    return state.items.filter((item) => item.status === 'Approved');
  };

  return (
    <ItemsContext.Provider
      value={{
        state,
        addItem,
        updateItemStatus,
        deleteItem,
        getItemsByStatus,
        getApprovedItems,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};

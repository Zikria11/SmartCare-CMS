import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
  userId: string;
  relatedId?: string; // ID of related entity (appointment, report, etc.)
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationsAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt' | 'read'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

const NotificationsContext = createContext<{
  state: NotificationsState;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
} | undefined>(undefined);

const notificationsReducer = (state: NotificationsState, action: NotificationsAction): NotificationsState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    case 'ADD_NOTIFICATION':
      const newNotification = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date(),
        read: false,
        ...action.payload
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    case 'REMOVE_NOTIFICATION':
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToRemove?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1)
      };
    default:
      return state;
  }
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [state, dispatch] = useReducer(notificationsReducer, {
    notifications: [],
    unreadCount: 0
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const setupRealTimeNotifications = (userId: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create a new Server-Sent Events connection
    const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5056/api'}/notifications/connect/${userId}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        // Parse the incoming message
        const messageData = JSON.parse(event.data);
        
        // Add the notification to the state
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            ...messageData,
            userId: userId
          }
        });
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (profile?.id) {
          setupRealTimeNotifications(profile.id);
        }
      }, 5000);
    };
  };

  // Fetch notifications from backend and set up real-time updates
  useEffect(() => {
    if (profile?.id) {
      const fetchNotifications = async () => {
        try {
          // Make API call to fetch notifications
          const response = await apiService.getNotifications(profile.id);
          
          // Convert string dates to Date objects
          const notifications = response.map((notification: any) => ({
            ...notification,
            createdAt: new Date(notification.createdAt),
          }));
          
          dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
          
          // Set up a subscription to listen for real-time notifications using Server-Sent Events
          setupRealTimeNotifications(profile.id);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        }
      };
      
      fetchNotifications();
    }
    
    // Clean up the event source when the component unmounts
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [profile?.id]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) => {
    if (profile?.id) {
      try {
        // Make API call to save the notification
        const response = await apiService.createNotification({
          ...notification,
          userId: profile.id
        });
        
        // Dispatch the new notification to the local state
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            ...notification,
            userId: profile.id
          }
        });
      } catch (error) {
        console.error('Error adding notification:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Make API call to update notification status
      await apiService.markNotificationAsRead(id);
        
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
    
  const markAllAsRead = async () => {
    try {
      // Make API call to mark all notifications as read
      await apiService.markAllNotificationsAsRead();
        
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
    
  const removeNotification = async (id: string) => {
    try {
      // Make API call to delete notification
      await apiService.deleteNotification(id);
        
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };
    
  return (
    <NotificationsContext.Provider value={{ state, addNotification, markAsRead, markAllAsRead, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
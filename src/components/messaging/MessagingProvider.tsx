import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  content: string;
  timestamp: Date;
  read: boolean;
  conversationId: string;
}

interface Conversation {
  id: string;
  participants: string[]; // User IDs
  participantDetails: {
    id: string;
    name: string;
    role: string;
  }[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface MessagingState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
}

type MessagingAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'MARK_AS_READ'; payload: { conversationId: string; messageId?: string } }
  | { type: 'ADD_CONVERSATION'; payload: Conversation };

const MessagingContext = createContext<{
  state: MessagingState;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  startConversation: (participantIds: string[]) => string;
  markAsRead: (conversationId: string, messageId?: string) => void;
} | undefined>(undefined);

const messagingReducer = (state: MessagingState, action: MessagingAction): MessagingState => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: { 
          ...state.messages, 
          [action.payload.conversationId]: action.payload.messages 
        } 
      };
    case 'ADD_MESSAGE':
      const convId = action.payload.conversationId;
      const existingMessages = state.messages[convId] || [];
      const updatedMessages = [...existingMessages, action.payload];
      
      // Update conversation's last message
      const updatedConversations = state.conversations.map(conv => 
        conv.id === convId 
          ? { 
              ...conv, 
              lastMessage: action.payload.content,
              lastMessageTime: action.payload.timestamp,
              unreadCount: conv.participants.includes(action.payload.receiverId) && 
                          action.payload.senderId !== action.payload.receiverId
                ? conv.unreadCount + 1
                : conv.unreadCount
            }
          : conv
      );
      
      return {
        ...state,
        conversations: updatedConversations,
        messages: {
          ...state.messages,
          [convId]: updatedMessages
        }
      };
    case 'MARK_AS_READ':
      const { conversationId, messageId } = action.payload;
      const conv = state.conversations.find(c => c.id === conversationId);
      if (!conv) return state;
      
      const updatedConv = {
        ...conv,
        unreadCount: 0
      };
      
      const updatedConvMessages = state.messages[conversationId] || [];
      const updatedMessagesWithReadStatus = updatedConvMessages.map(msg => 
        (messageId ? msg.id === messageId : msg.conversationId === conversationId) 
          ? { ...msg, read: true }
          : msg
      );
      
      return {
        ...state,
        conversations: state.conversations.map(c => 
          c.id === conversationId ? updatedConv : c
        ),
        messages: {
          ...state.messages,
          [conversationId]: updatedMessagesWithReadStatus
        }
      };
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload]
      };
    default:
      return state;
  }
};

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [state, dispatch] = useReducer(messagingReducer, {
    conversations: [],
    messages: {}
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const setupRealTimeMessages = (userId: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create a new Server-Sent Events connection
    const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5056/api'}/messages/connect/${userId}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        // Parse the incoming message
        const messageData = JSON.parse(event.data);
        
        // Add the message to the state
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            ...messageData,
            timestamp: new Date(messageData.timestamp)
          }
        });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (profile?.id) {
          setupRealTimeMessages(profile.id);
        }
      }, 5000);
    };
  };

  // Fetch conversations and messages from backend and set up real-time updates
  useEffect(() => {
    if (profile?.id) {
      const fetchConversations = async () => {
        try {
          // Make API calls to fetch conversations and messages
          const conversationsResponse = await apiService.getConversations(profile.id);
          const messagesResponse = await apiService.getMessages(profile.id);
          
          // Convert string dates to Date objects
          const conversations = conversationsResponse.map((conv: any) => ({
            ...conv,
            lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime) : undefined,
          }));
          
          const messages = messagesResponse.reduce((acc: Record<string, Message[]>, msg: any) => {
            const convId = msg.conversationId;
            if (!acc[convId]) {
              acc[convId] = [];
            }
            acc[convId].push({
              ...msg,
              timestamp: new Date(msg.timestamp),
            });
            return acc;
          }, {});
          
          dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
          
          // Set up messages in state
          Object.entries(messages).forEach(([convId, msgs]) => {
            if (msgs && Array.isArray(msgs)) {
              dispatch({ 
                type: 'SET_MESSAGES', 
                payload: { conversationId: convId, messages: msgs } 
              });
            }
          });
          
          // Set up a subscription to listen for real-time messages using Server-Sent Events
          setupRealTimeMessages(profile.id);
        } catch (error) {
          console.error('Error fetching conversations:', error);
          dispatch({ type: 'SET_CONVERSATIONS', payload: [] });
        }
      };
      
      fetchConversations();
    }
    
    // Clean up the event source when the component unmounts
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [profile?.id, profile?.fullName, profile?.role]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!profile?.id) return;
    
    try {
      // Make API call to send the message
      const response = await apiService.createMessage({
        receiverId,
        content,
        senderId: profile.id
      });
      
      // The response should contain the complete message object from the backend
      const message: Message = {
        id: response.id,
        senderId: response.senderId || profile.id,
        senderName: response.senderName || profile.fullName,
        senderRole: response.senderRole || profile.role,
        receiverId: response.receiverId,
        receiverName: response.receiverName || 'Unknown User',
        receiverRole: response.receiverRole || 'User',
        content: response.content,
        timestamp: new Date(response.timestamp),
        read: response.read || false,
        conversationId: response.conversationId
      };
      
      // Update the local state with the new message
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startConversation = (participantIds: string[]): string => {
    const newConversationId = `conv${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      participants: participantIds,
      participantDetails: [], // In real app, fetch user details
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0
    };
    
    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    return newConversationId;
  };

  const markAsRead = async (conversationId: string, messageId?: string) => {
    try {
      // Make API call to mark message(s) as read
      await apiService.markMessageAsRead(conversationId, messageId);
      
      dispatch({ type: 'MARK_AS_READ', payload: { conversationId, messageId } });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <MessagingContext.Provider value={{ state, sendMessage, startConversation, markAsRead }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
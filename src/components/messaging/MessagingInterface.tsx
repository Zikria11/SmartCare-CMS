import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessaging } from '@/components/messaging/MessagingProvider';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const MessagingInterface: React.FC = () => {
  const { state, sendMessage, markAsRead } = useMessaging();
  const { profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // In a real app, we would determine the receiver from the conversation
    const conversation = state.conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.participants.find(id => id !== profile?.id);
    if (!receiverId) return;

    sendMessage(receiverId, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (conversation: { participantDetails: { id: string; name: string; role: string }[]; participants: string[] }) => {
    if (!profile?.id) return null;
    
    const other = conversation.participantDetails.find(p => p.id !== profile.id);
    if (other) return other;
    
    // If participant details are not loaded, try to find by ID
    const otherId = conversation.participants.find(id => id !== profile.id);
    return otherId ? { id: otherId, name: 'Unknown User', role: 'User' } : null;
  };

  const selectedConv = selectedConversation 
    ? state.conversations.find(c => c.id === selectedConversation)
    : null;

  return (
    <div className="flex h-full bg-background rounded-lg border">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {state.conversations.map(conversation => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = conversation.id === selectedConversation;
            
            return (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                  isSelected ? 'bg-primary/10' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  markAsRead(conversation.id);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {otherParticipant?.name || 'Unknown'}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.lastMessageTime && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(conversation.lastMessageTime, 'MMM d')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center">
              {getOtherParticipant(selectedConv) && (
                <>
                  <div className="font-semibold">
                    {getOtherParticipant(selectedConv)?.name}
                  </div>
                  <div className="ml-2 text-xs text-muted-foreground">
                    ({getOtherParticipant(selectedConv)?.role})
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.messages[selectedConversation]?.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === profile?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === profile?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-xs mt-1 ${message.senderId === profile?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(message.timestamp, 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;
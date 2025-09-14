import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, Message } from '../../../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import MessageInput from './MessageInput';
import Spinner from '../../../components/ui/Spinner';
import { FileText, Image } from 'lucide-react';

interface ChatInterfaceProps {
  otherUserId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ otherUserId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [user, otherUserId]);

  useEffect(() => {
    const channel = supabase.channel(`messages:${user?.id}:${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        if ((newMessage.sender_id === user?.id && newMessage.receiver_id === otherUserId) || 
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === user?.id)) {
          setMessages(currentMessages => [...currentMessages, newMessage]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageContent = (message: Message) => {
    switch (message.message_type) {
      case 'image':
        return <img src={message.file_url} alt="Image" className="max-w-xs rounded-lg" />;
      case 'file':
        return (
          <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 p-2 bg-gray-200 rounded-lg">
            <FileText className="w-6 h-6" />
            <span>{message.content || 'Fichier'}</span>
          </a>
        );
      case 'gif':
        return <img src={message.sticker_url} alt="GIF" className="max-w-xs rounded-lg" />;
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-sm ${msg.sender_id === user?.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {renderMessageContent(msg)}
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-primary-200' : 'text-gray-500'}`}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <MessageInput receiverId={otherUserId} />
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { Send, Paperclip, Smile } from 'lucide-react';
import GiphyPicker from './GiphyPicker';

interface MessageInputProps {
  receiverId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ receiverId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [showGiphy, setShowGiphy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content,
      message_type: 'text',
    });

    if (error) {
      toast.error("Erreur lors de l'envoi du message.");
    } else {
      setContent('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const toastId = toast.loading('Téléversement du fichier...');
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${new Date().getTime()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('chat_files').getPublicUrl(filePath);
      
      const { error: messageError } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: file.name,
        file_url: urlData.publicUrl,
        message_type: file.type.startsWith('image/') ? 'image' : 'file',
      });

      if (messageError) throw messageError;
      toast.success('Fichier envoyé !', { id: toastId });

    } catch (error) {
      toast.error('Erreur lors de l\'envoi du fichier.', { id: toastId });
      console.error(error);
    }
  };

  const handleGiphySelect = async (gifUrl: string) => {
    if (!user) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      sticker_url: gifUrl,
      message_type: 'gif',
    });
    if (error) toast.error("Erreur lors de l'envoi du GIF.");
    setShowGiphy(false);
  };

  return (
    <div className="relative">
      {showGiphy && <GiphyPicker onSelect={handleGiphySelect} />}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary-600">
          <Paperclip className="w-5 h-5" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        
        <button type="button" onClick={() => setShowGiphy(!showGiphy)} className="p-2 text-gray-500 hover:text-primary-600">
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez un message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300" disabled={!content.trim()}>
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { MessageCircle, User } from 'lucide-react';

interface Conversation {
  other_user_id: string;
  last_message_content: string;
  last_message_at: string;
  profile: Profile;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_conversations', { user_id_param: user.id });
        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors de la récupération des conversations.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messagerie</h1>
      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-10 h-10" />}
          title="Aucune conversation"
          description="Vous n'avez pas encore de messages. Commencez une consultation pour discuter avec un médecin."
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ul className="divide-y divide-gray-200">
            {conversations.map(convo => (
              <li key={convo.other_user_id}>
                <Link to={`/messages/${convo.other_user_id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        {convo.profile.avatar_url ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={convo.profile.avatar_url} alt="" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">{convo.profile.first_name} {convo.profile.last_name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{convo.last_message_content}</span>
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <div>
                            <p className="text-sm text-gray-900">
                              <time dateTime={convo.last_message_at}>
                                {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true, locale: fr })}
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment } from '../../lib/supabase';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import ChatInterface from '../messages/components/ChatInterface';

const signalingServerUrl = import.meta.env.VITE_SIGNALING_SERVER_URL;

const VideoCallPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const socket = useRef<any>();

  useEffect(() => {
    socket.current = io(signalingServerUrl);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });

    socket.current.on('callUser', (data: any) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, parent:profiles(*), doctor:profiles(*), child:children(*)')
          .eq('id', appointmentId)
          .single();
        if (error) throw error;
        setAppointment(data as Appointment);

        // Join the socket room
        socket.current.emit('join-room', appointmentId, user?.id);

      } catch (error) {
        toast.error("Impossible de charger les détails de la consultation.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId, user]);

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socket.current.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: user?.id,
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.current.on('callAccepted', (signal: any) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socket.current.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
  };

  const leaveCall = () => {
    setCallEnded(true);
    stream?.getTracks().forEach(track => track.stop());
    // Notify other user
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCameraOn;
      setIsCameraOn(!isCameraOn);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  if (!appointment) {
    return <div className="text-center py-10">Consultation non trouvée.</div>;
  }

  const otherParticipant = user?.id === appointment.parent_id ? appointment.doctor : appointment.parent;

  return (
    <div className="container mx-auto px-4 py-8 h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Consultation Vidéo</h1>
      <p className="text-gray-600 mb-8">Avec Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name} pour {appointment.child?.first_name}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)]">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 flex flex-col relative">
          <div className="flex-1 grid grid-cols-1 gap-4">
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="absolute bottom-16 right-4 w-48 h-32">
             <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover rounded-lg border-2 border-white" />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/50 p-3 rounded-full">
            <button onClick={toggleMic} className="p-3 bg-white/20 rounded-full text-white">
              {isMicOn ? <Mic /> : <MicOff />}
            </button>
            <button onClick={toggleCamera} className="p-3 bg-white/20 rounded-full text-white">
              {isCameraOn ? <Video /> : <VideoOff />}
            </button>
            <button onClick={leaveCall} className="p-3 bg-red-500 rounded-full text-white">
              <PhoneOff />
            </button>
          </div>
          {!callAccepted && !callEnded && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
              {receivingCall ? (
                <>
                  <p className="text-white text-lg mb-4">Dr. {otherParticipant?.first_name} vous appelle...</p>
                  <Button onClick={answerCall}>Répondre</Button>
                </>
              ) : (
                <Button onClick={() => callUser(otherParticipant!.id)}>Appeler le médecin</Button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col !p-0">
            <h3 className="p-4 text-lg font-bold border-b">Chat</h3>
            <ChatInterface otherUserId={otherParticipant!.id} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;

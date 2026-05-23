import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Mic, Square, Play, Upload } from 'lucide-react';

export default function Admin() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // New Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // We would fetch all users and all tasks here
    // In a real app, you'd need an admin-only endpoint for this.
    // For now, let's mock it or use an existing endpoint if it returns all users.
    // Mocking for UI demonstration:
    setUsers([
      { id: 1, username: 'alice' },
      { id: 2, username: 'bob' }
    ]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskRes = await api.post('/tasks', {
        title,
        description,
        priority,
        assigned_to: parseInt(assignedTo) || null
      });

      if (audioBlob) {
        const formData = new FormData();
        // The backend expects a file upload
        formData.append('file', audioBlob, 'voicenote.webm');
        await api.post(`/tasks/${taskRes.data.id}/voice`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setAudioBlob(null);
      setAudioURL('');
      alert("Task assigned successfully!");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage users and assign tasks.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2">Assign New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue"
                >
                  <option value="">Select User...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Voice Instructions (Optional)</label>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40 transition-colors"
                  >
                    <Mic size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-3 bg-gray-500/20 text-gray-300 rounded-full hover:bg-gray-500/40 transition-colors flex items-center gap-2"
                  >
                    <Square size={20} /> Stop
                  </button>
                )}
                {isRecording && <span className="text-red-500 animate-pulse text-sm font-semibold">Recording...</span>}
                {audioURL && !isRecording && (
                  <audio src={audioURL} controls className="h-10 flex-1" />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-lg bg-neonBlue text-black font-bold hover:bg-opacity-90 transition-opacity"
            >
              Create & Assign Task
            </button>
          </form>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2">Recent Submissions (Mock)</h2>
          <div className="space-y-4">
             {/* Mock Submissions for UI */}
             <div className="p-4 bg-white/5 rounded-lg border border-white/10">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-neonBlue">Update Dashboard UI</h4>
                 <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Pending Review</span>
               </div>
               <p className="text-sm text-gray-400">Submitted by <strong>alice</strong> 2 hours ago</p>
               <div className="mt-3 flex gap-2">
                 <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/40 transition-colors">Approve</button>
                 <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/40 transition-colors">Reject</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

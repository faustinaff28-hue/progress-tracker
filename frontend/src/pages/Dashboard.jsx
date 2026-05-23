import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { Target, Zap, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="neon-text">{user?.username}</span>!</h1>
        <p className="text-gray-400">Here's an overview of your progress today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 border-t-2 border-neonBlue">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400">Total XP</p>
              <h3 className="text-2xl font-bold text-white">{user?.xp}</h3>
            </div>
            <Zap className="text-neonBlue" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-neonBlue h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">120 XP to next level</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-neonPurple">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400">Current Rank</p>
              <h3 className="text-xl font-bold text-white">{user?.rank}</h3>
            </div>
            <Target className="text-neonPurple" />
          </div>
          <p className="text-xs text-neonPurple font-medium bg-neonPurple/10 px-2 py-1 rounded inline-block">Top 15%</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-neonGreen">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400">Day Streak</p>
              <h3 className="text-2xl font-bold text-white">{user?.streak}</h3>
            </div>
            <Activity className="text-neonGreen" />
          </div>
          <p className="text-xs text-gray-500">You're on fire! Keep it up.</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-yellow-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-white">4</h3>
            </div>
            <Clock className="text-yellow-500" />
          </div>
          <p className="text-xs text-gray-500">2 due today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-neonBlue hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {/* Mock recent tasks */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold text-white">Frontend API Integration</h4>
                  <p className="text-sm text-gray-400">Due Tomorrow</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">In Progress</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Latest Achievements</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonBlue to-neonPurple flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  🌟
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">First Blood</h4>
                <p className="text-xs text-gray-400">Complete your first task</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonGreen to-blue-500 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  🔥
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">3-Day Streak</h4>
                <p className="text-xs text-gray-400">Log in for 3 consecutive days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Cpu, BarChart3, Shield, Zap, Globe, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: <FlaskConical size={24} className="text-cyan-400" />,
    title: 'AR Physics Experiments',
    description:
      'Conduct real physics experiments in augmented reality — simulated equipment, real results.',
  },
  {
    icon: <Cpu size={24} className="text-violet-400" />,
    title: 'AI-Powered Analytics',
    description:
      'Intelligent tracking of student progress, conceptual gaps, and personalised recommendations.',
  },
  {
    icon: <BarChart3 size={24} className="text-emerald-400" />,
    title: 'Real-time Dashboards',
    description:
      'Live performance metrics, class-wide trends, and individual student progress reports.',
  },
  {
    icon: <Shield size={24} className="text-amber-400" />,
    title: 'Role-based Access',
    description:
      'Purpose-built interfaces for students, educators, and administrators.',
  },
  {
    icon: <Zap size={24} className="text-pink-400" />,
    title: '3D Virtual Equipment',
    description:
      'Interact with photorealistic 3D models of standard physics laboratory apparatus.',
  },
  {
    icon: <Globe size={24} className="text-blue-400" />,
    title: 'Mobile-ready AR',
    description:
      'Access experiments on any mobile device — no physical lab required.',
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FlaskConical size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Smart AR Physics Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm px-4 py-2 rounded-full font-medium mb-8">
            <Zap size={14} />
            AI-Powered Augmented Reality Learning
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Physics Lab.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Conduct real physics experiments in an immersive augmented reality environment,
            powered by AI learning analytics that track, understand, and personalise your
            educational journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xl shadow-cyan-500/20 text-base"
            >
              Start Learning Free <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base border border-slate-700"
            >
              Sign In to Continue
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-10 border-t border-slate-800/50">
            {[
              { value: '20+', label: 'AR Experiments' },
              { value: '6', label: 'Physics Categories' },
              { value: 'Real-time', label: 'AI Analytics' },
              { value: '3', label: 'Role Dashboards' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="text-cyan-400">master physics</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A complete platform for students, educators, and institutions to deliver
              next-generation STEM education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to enter the lab?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join students and educators using Smart AR Physics Lab to transform how physics
            is taught and learned.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xl shadow-cyan-500/20 text-base"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-md flex items-center justify-center">
              <FlaskConical size={12} className="text-white" />
            </div>
            <span className="text-slate-400 text-sm">Smart AR Physics Lab © 2026</span>
          </div>
          <p className="text-slate-600 text-xs">
            Built for educational excellence — AI-powered, AR-enhanced.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

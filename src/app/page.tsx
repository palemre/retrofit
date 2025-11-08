// src/app/page.tsx
'use client';

import WalletConnect from '@/components/WalletConnect';
import { useAllProjects } from '@/hooks/useAllProjects';

export default function Home() {
  const { projects, loading } = useAllProjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects from blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              🌱 RetroFit Finance
            </h1>
            <p className="text-gray-600 mt-2">
              Invest in sustainable building upgrades and earn returns
            </p>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{projects.length}</div>
            <div className="text-gray-600">Active Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${projects.reduce((sum, p) => sum + parseFloat(p.raisedAmount), 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Funded</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">8.5%</div>
            <div className="text-gray-600">Avg. Return</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {projects.reduce((sum, p) => sum + parseInt(p.investorCount), 0)}
            </div>
            <div className="text-gray-600">Active Investors</div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'Funding' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  📍 {project.address}
                </p>
                
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Investor Count */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{project.investorCount} investors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📈</span>
                    <span>{project.expectedReturn}</span>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>${parseFloat(project.raisedAmount).toLocaleString()} / ${parseFloat(project.targetAmount).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((parseFloat(project.raisedAmount) / parseFloat(project.targetAmount)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = `/projects/${project.id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  View Project Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>Building a sustainable future, one retrofit at a time.</p>
        </div>
      </footer>
    </div>
  );
}
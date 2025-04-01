"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaFileAlt, FaRobot, FaSearch, FaEdit, FaUpload, FaLink } from 'react-icons/fa';

export default function Home() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your email collection logic here
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="pt-24 pb-16 px-4 text-center bg-gray-50">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Resume<span className="text-blue-700">Tailor</span>
        </h1>
        <p className="text-xl text-gray-800 max-w-2xl mx-auto mb-10">
          AI-powered resumes tailored specifically to the jobs you want, leveraging your GitHub projects and work experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/login" className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium">
            Get Started
          </Link>
          <Link href="/demo" className="px-8 py-3 bg-white text-blue-700 border border-blue-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            See Demo
          </Link>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-1">
              <img 
                src="/resume-preview.png" 
                alt="Resume preview" 
                className="w-[64rem] h-[32rem] rounded-lg object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x450?text=Resume+Preview";
                }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">What Makes ResumeTailor Special</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Job Analysis</h3>
              <p className="text-gray-700">Upload job descriptions and our AI extracts key requirements and skills.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaGithub className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">GitHub Integration</h3>
              <p className="text-gray-700">Connect your GitHub to showcase relevant projects and contributions.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaRobot className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Enhancement</h3>
              <p className="text-gray-700">Our AI crafts compelling bullet points highlighting your matching skills.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaFileAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">LaTeX Export</h3>
              <p className="text-gray-700">Generate professional, beautifully formatted resumes ready to submit.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works section (replacing testimonials) */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FaUpload className="text-blue-700 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Upload Job Listing</h3>
              </div>
              <p className="text-gray-700">Paste a job description or upload a PDF, and our AI will analyze the key requirements.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FaFileAlt className="text-blue-700 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Your Experience</h3>
              </div>
              <p className="text-gray-700">Upload your current resume or enter your work experience and education details.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FaLink className="text-blue-700 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Connect GitHub</h3>
              </div>
              <p className="text-gray-700">Link your GitHub account to automatically import projects relevant to the job.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <FaEdit className="text-blue-700 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Edit & Export</h3>
              </div>
              <p className="text-gray-700">Review AI suggestions, make adjustments, and export your perfectly tailored resume.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 px-4 bg-blue-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to tailor your resume?</h2>
          <p className="text-xl mb-8">Get early access to our platform and start landing more interviews</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white rounded-lg text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Get Early Access
            </button>
          </form>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold">Resume<span className="text-blue-400">Tailor</span></h3>
            <p className="text-sm">© 2025 All rights reserved</p>
          </div>
          
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

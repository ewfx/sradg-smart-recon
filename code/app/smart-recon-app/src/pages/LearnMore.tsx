
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, ExternalLink } from 'lucide-react';

const LearnMore: React.FC = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                🚀 Smart Reconciliation & Anomaly Detection
              </h1>
              <Button className="mt-4 md:mt-0">
                <ExternalLink className="mr-2 h-4 w-4" />
                Live Demo
              </Button>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <h2 id="table-of-contents" className="text-2xl font-semibold mt-8 mb-4">📌 Table of Contents</h2>
              <ul>
                <li><a href="#introduction" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Introduction</a></li>
                <li><a href="#demo" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Demo</a></li>
                <li><a href="#inspiration" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Inspiration</a></li>
                <li><a href="#what-it-does" className="no-underline hover:underline text-blue-600 dark:text-blue-400">What It Does</a></li>
                <li><a href="#how-we-built-it" className="no-underline hover:underline text-blue-600 dark:text-blue-400">How We Built It</a></li>
                <li><a href="#challenges-we-faced" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Challenges We Faced</a></li>
                <li><a href="#how-to-run" className="no-underline hover:underline text-blue-600 dark:text-blue-400">How to Run</a></li>
                <li><a href="#tech-stack" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Tech Stack</a></li>
                <li><a href="#team" className="no-underline hover:underline text-blue-600 dark:text-blue-400">Team</a></li>
              </ul>
              
              <hr className="my-8" />
              
              <h2 id="introduction" className="text-2xl font-semibold mt-8 mb-4">🎯 Introduction</h2>
              <p>
                Smart Reconciliation & Anomaly Detection is a GenAI-powered platform that automates financial data reconciliation between multiple systems (e.g., GL vs iHub) and detects anomalies intelligently. It aims to streamline the traditionally manual, error-prone reconciliation process using AI-driven analysis and insights. This project addresses the hackathon problem statement: "Smarter Reconciliation and Anomaly Detection using GenAI".
              </p>
              
              <h2 id="demo" className="text-2xl font-semibold mt-8 mb-4">🎥 Demo</h2>
              <p>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">🔗 Live Demo</a><br />
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">📹 Video Demo</a>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="rounded-lg overflow-hidden border dark:border-gray-700">
                  <img 
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                    alt="Dashboard screenshot" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="rounded-lg overflow-hidden border dark:border-gray-700">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                    alt="Anomaly detection screenshot" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              <h2 id="inspiration" className="text-2xl font-semibold mt-8 mb-4">💡 Inspiration</h2>
              <p>
                Manual reconciliation in financial systems is time-consuming, repetitive, and prone to human error. Our inspiration came from the need to automate this workflow intelligently using machine learning and generative AI, reducing effort while improving accuracy and traceability.
              </p>
              
              <h2 id="what-it-does" className="text-2xl font-semibold mt-8 mb-4">⚙️ What It Does</h2>
              <ul>
                <li>Ingests and processes historical and real-time financial data</li>
                <li>Detects anomalies using Isolation Forest models per account/entity</li>
                <li>Maps anomalies to meaningful business buckets (e.g., "Reversal Entry", "Gradual Deviation")</li>
                <li>Generates AI-driven insights using GPT-4o or open-source LLMs</li>
                <li>Provides downloadable anomaly reports and insights for finance teams</li>
                <li>Offers a seamless API-driven interface to integrate with UIs</li>
              </ul>
              
              <h2 id="how-we-built-it" className="text-2xl font-semibold mt-8 mb-4">🛠️ How We Built It</h2>
              <p>
                We built the solution using Python (FastAPI backend), Pandas for data wrangling, and scikit-learn for ML modeling. For insight generation, we used OpenAI's GPT-4o and fallback options like HuggingFace models. The system is modular and structured for configurability, including a UI integration-ready backend.
              </p>
              
              <h2 id="challenges-we-faced" className="text-2xl font-semibold mt-8 mb-4">🚧 Challenges We Faced</h2>
              <ul>
                <li>Handling diverse financial data formats and real-time ingestion</li>
                <li>Mapping raw anomaly outputs to interpretable business buckets</li>
                <li>Managing large model integration (e.g., LLaMA, Mistral) with limited compute</li>
                <li>Ensuring fast performance and accuracy in anomaly detection</li>
                <li>Rate limits and authentication hurdles with OpenAI during testing</li>
              </ul>
              
              <h2 id="how-to-run" className="text-2xl font-semibold mt-8 mb-4">🏃 How to Run</h2>
              <ol>
                <li>Clone the repository</li>
                <li>Install dependencies</li>
                <li>Run the FastAPI backend</li>
                <li>Upload reconciliation files via the UI or API</li>
                <li>Call /test or /insights endpoint to see results</li>
              </ol>
              
              <h2 id="tech-stack" className="text-2xl font-semibold mt-8 mb-4">🏗️ Tech Stack</h2>
              <ul>
                <li>🔹 <strong>Frontend:</strong> React (UI under development)</li>
                <li>🔹 <strong>Backend:</strong> FastAPI (Python)</li>
                <li>🔹 <strong>ML/AI:</strong> scikit-learn, OpenAI API, HuggingFace Transformers</li>
                <li>🔹 <strong>Storage:</strong> Local CSV-based storage (for demo)</li>
                <li>🔹 <strong>Other:</strong> Pandas, Faker, Isolation Forest, LLM-based insights</li>
              </ul>
              
              <h2 id="team" className="text-2xl font-semibold mt-8 mb-4">👥 Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    SK
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Sujeet Kumar</h3>
                    <div className="flex space-x-2 mt-1">
                      <a href="#" className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <Github size={20} />
                      </a>
                      <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Smart-Recon
              </span>
              <p className="mt-2 text-gray-400 text-sm">
                Smarter Reconciliation and Anomaly Detection using Gen AI
              </p>
              <p className="mt-1 text-gray-400 text-sm">
                Developed By: Sujeet Kumar
              </p>
            </div>
            <div className="flex space-x-8">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Smart-Recon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;

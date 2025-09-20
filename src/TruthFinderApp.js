import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink, TrendingUp, Eye, Brain, Zap } from 'lucide-react';

const TruthFinderApp = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyzeArticle = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('https://truthfinderai-backend.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAnalysis(data);
      } else {
        setError(data.error || 'Failed to analyze article');
      }
    } catch (err) {
      setError('Failed to connect to the analysis service. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrustScoreIcon = (score) => {
    if (score >= 8) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (score >= 6) return <Eye className="w-6 h-6 text-yellow-400" />;
    return <AlertTriangle className="w-6 h-6 text-red-400" />;
  };

  const getSensationalismColor = (score) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    if (score <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1.5\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      }}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-500/20 rounded-full mr-4">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                TruthFinder AI
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your AI-powered media literacy co-pilot. Analyze articles for bias, manipulation, and trustworthiness.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6">
          {/* Input Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/10">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter article URL to analyze..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeArticle()}
                />
              </div>
              <button
                onClick={analyzeArticle}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trust Score */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Trust Score</h3>
                    {getTrustScoreIcon(analysis.trustScore)}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    <span className={getTrustScoreColor(analysis.trustScore)}>
                      {analysis.trustScore}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analysis.trustScore >= 8 ? 'bg-green-400' : analysis.trustScore >= 6 ? 'bg-yellow-400' : analysis.trustScore >= 4 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${analysis.trustScore * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Sensationalism */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Sensationalism</h3>
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    <span className={getSensationalismColor(analysis.sensationalismScore)}>
                      {analysis.sensationalismScore}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analysis.sensationalismScore <= 3 ? 'bg-green-400' : analysis.sensationalismScore <= 6 ? 'bg-yellow-400' : analysis.sensationalismScore <= 8 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${analysis.sensationalismScore * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Final Verdict */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Verdict</h3>
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {analysis.finalVerdict}
                  </p>
                </div>
              </div>

              {/* Article Details */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                <div className="flex items-start gap-4 mb-6">
                  <ExternalLink className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {analysis.title || 'Article Analysis'}
                    </h2>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {url}
                    </a>
                  </div>
                </div>
                
                {analysis.summary && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                    <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
                  </div>
                )}

                {analysis.toneAnalysis && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-3">Tone Analysis</h3>
                    <p className="text-gray-300 leading-relaxed">{analysis.toneAnalysis}</p>
                  </div>
                )}
              </div>

              {/* Manipulative Techniques */}
              {analysis.manipulativeTechniques && analysis.manipulativeTechniques.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Manipulative Techniques Detected
                  </h3>
                  <div className="space-y-4">
                    {analysis.manipulativeTechniques.map((technique, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-semibold text-orange-400 mb-2">
                          {technique.technique}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {technique.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-gray-400">
            Powered by AI • Built for media literacy • Stay informed, stay critical
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TruthFinderApp;

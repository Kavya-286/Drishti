import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import {
  ArrowLeft,
  Star,
  Search,
  Eye,
  DollarSign,
  Trash2,
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-react';

export default function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!user || !isAuthenticated || isAuthenticated !== 'true') {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.userType !== 'investor') {
      navigate('/dashboard');
      return;
    }

    // Load watchlist
    const loadWatchlist = () => {
      try {
        const savedWatchlist = JSON.parse(localStorage.getItem('investorWatchlist') || '[]');
        setWatchlist(savedWatchlist);
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, [navigate]);

  const handleRemoveFromWatchlist = (startupId: string) => {
    const updatedWatchlist = watchlist.filter(item => item.id !== startupId);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('investorWatchlist', JSON.stringify(updatedWatchlist));
    alert('Removed from watchlist');
  };

  const handleViewDetails = (startupId: string) => {
    navigate(`/startup-details/${startupId}`);
  };

  const handleInvest = (startupId: string) => {
    navigate(`/investment-action/${startupId}`, { 
      state: { action: 'invest' } 
    });
  };

  const filteredWatchlist = watchlist.filter(startup =>
    startup.ideaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    startup.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getViabilityBadge = (level: string) => {
    const colors = {
      'High': 'bg-green-500 text-white',
      'Moderate': 'bg-yellow-500 text-white',
      'Low': 'bg-red-500 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => navigate('/investor-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary">{watchlist.length} startups watched</Badge>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Star className="w-8 h-8 mr-3 text-yellow-500" />
              My Watchlist
            </h1>
            <p className="text-muted-foreground">
              Track and manage startups you're interested in investing in
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your watchlist..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Watchlist Content */}
          {filteredWatchlist.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {watchlist.length === 0 ? 'Your watchlist is empty' : 'No startups found'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {watchlist.length === 0 
                      ? 'Start adding interesting startups to your watchlist from the opportunities page'
                      : 'Try adjusting your search criteria'
                    }
                  </p>
                  <Button onClick={() => navigate('/investor-dashboard')}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Browse Opportunities
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredWatchlist.map((startup) => (
                <Card key={startup.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{startup.ideaName}</span>
                          <Badge variant="secondary">{startup.industry}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Added to watchlist on {new Date(startup.addedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getViabilityBadge(startup.viabilityLevel || 'Moderate')}>
                          {typeof startup.validationScore === 'number' && !isNaN(startup.validationScore) ? startup.validationScore : 0}/100
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWatchlist(startup.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Validation Score</div>
                        <div className="font-semibold text-primary">{typeof startup.validationScore === 'number' && !isNaN(startup.validationScore) ? startup.validationScore : 0}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Viability</div>
                        <Badge variant="outline" className={startup.viabilityLevel === 'High' ? 'border-green-500 text-green-600' : startup.viabilityLevel === 'Moderate' ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}>
                          {startup.viabilityLevel || 'Moderate'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Industry</div>
                        <div className="font-semibold">{startup.industry}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Added</div>
                        <div className="font-semibold">{new Date(startup.addedAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Watching since {new Date(startup.addedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewDetails(startup.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleInvest(startup.id)}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Invest
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {watchlist.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Watchlist Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">{watchlist.length}</div>
                    <div className="text-sm text-muted-foreground">Total Startups</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {watchlist.length > 0 ? Math.round(watchlist.reduce((sum, startup) => sum + (typeof startup.validationScore === 'number' && !isNaN(startup.validationScore) ? startup.validationScore : 0), 0) / watchlist.length) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Validation Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {[...new Set(watchlist.map(s => s.industry))].length}
                    </div>
                    <div className="text-sm text-muted-foreground">Industries</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

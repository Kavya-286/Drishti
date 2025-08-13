import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationBell from './NotificationBell';
import {
  Lightbulb,
  Home,
  ChevronRight,
  User,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  showBreadcrumbs?: boolean;
}

const Header = ({ showBreadcrumbs = true }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    const authStatus = localStorage.getItem('isAuthenticated');
    
    if (user && authStatus === 'true') {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  // Get breadcrumb data based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { name: 'Home', href: '/', icon: Home }
    ];

    switch (path) {
      case '/dashboard':
        breadcrumbs.push({ name: 'Dashboard', href: '/dashboard', icon: BarChart3 });
        break;
      case '/investor-dashboard':
        breadcrumbs.push({ name: 'Investor Dashboard', href: '/investor-dashboard', icon: DollarSign });
        break;
      case '/validate':
        breadcrumbs.push({ name: 'Validate Idea', href: '/validate', icon: Lightbulb });
        break;
      case '/results':
        breadcrumbs.push({ name: 'Validation Results', href: '/results', icon: BarChart3 });
        break;
      case '/auth':
        breadcrumbs.push({ name: 'Sign In', href: '/auth', icon: User });
        break;
      default:
        if (path !== '/') {
          breadcrumbs.push({ name: 'Page', href: path, icon: null });
        }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Main header */}
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Drishti
            </span>
            {currentUser && (
              <Badge variant="secondary" className="ml-2">
                {currentUser.userType === 'investor' ? 'Investor' : 'Entrepreneur'}
              </Badge>
            )}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/validate">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Validate Idea
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </>
            ) : (
              <>
                {currentUser?.userType === 'investor' ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/investor-dashboard">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/watchlist">
                        <Star className="w-4 h-4 mr-2" />
                        Watchlist
                      </Link>
                    </Button>
                    <NotificationBell />
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/dashboard">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/validate">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        New Validation
                      </Link>
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {currentUser?.firstName?.[0] || currentUser?.userType?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden lg:inline">
                        {currentUser?.firstName || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>

        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 1 && (
          <div className="py-2 border-t">
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                  )}
                  <Link
                    to={crumb.href}
                    className={`flex items-center space-x-1 hover:text-primary transition-colors ${
                      index === breadcrumbs.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {crumb.icon && <crumb.icon className="w-4 h-4" />}
                    <span>{crumb.name}</span>
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

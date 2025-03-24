
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun, UploadCloud, PieChart, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12 flex items-center justify-between',
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Smart-Recon
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <NavLink href="#upload" icon={<UploadCloud className="w-4 h-4 mr-2" />} text="Upload" />
        <NavLink href="#data" icon={<PieChart className="w-4 h-4 mr-2" />} text="Data" />
        <NavLink href="#anomalies" icon={<AlertTriangle className="w-4 h-4 mr-2" />} text="Anomalies" />
        <NavLink href="#insights" icon={<MessageSquare className="w-4 h-4 mr-2" />} text="AI Insights" />
        <Link to="/learn-more" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200">
          <Info className="w-4 h-4 mr-2" />
          <span>Learn More</span>
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg animate-fade-in-down">
          <div className="flex flex-col space-y-4 py-6 px-8">
            <MobileNavLink href="#upload" icon={<UploadCloud className="w-5 h-5 mr-3" />} text="Upload" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="#data" icon={<PieChart className="w-5 h-5 mr-3" />} text="Data" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="#anomalies" icon={<AlertTriangle className="w-5 h-5 mr-3" />} text="Anomalies" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="#insights" icon={<MessageSquare className="w-5 h-5 mr-3" />} text="AI Insights" onClick={() => setIsMobileMenuOpen(false)} />
            <Link 
              to="/learn-more" 
              className="flex items-center py-2 text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Info className="w-5 h-5 mr-3" />
              <span className="font-medium">Learn More</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
  <a
    href={href}
    className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
  >
    {icon}
    <span>{text}</span>
  </a>
);

const MobileNavLink = ({ href, icon, text, onClick }: { href: string; icon: React.ReactNode; text: string; onClick: () => void }) => (
  <a
    href={href}
    onClick={onClick}
    className="flex items-center py-2 text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors duration-200"
  >
    {icon}
    <span className="font-medium">{text}</span>
  </a>
);

export default Navbar;

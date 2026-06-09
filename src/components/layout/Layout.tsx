import { ReactNode } from 'react';
import { Header } from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

// wraps every page with header, navbar, and footer
const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
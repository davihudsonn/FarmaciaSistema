import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Plus, Pill, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/', label: 'Pedidos', icon: Package },
  { path: '/novo-pedido', label: 'Anotar Falta', icon: Plus },
];

function NavLink({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
}

function Sidebar({ onNavClick, signOut }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Menor Preço</h1>
            <p className="text-xs text-muted-foreground">Controle de Pedidos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} onClick={onNavClick} />
        ))}
      </nav>

      <div className="px-4 py-4 mt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="p-4 mx-4 mb-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sistema de controle de pedidos de medicamentos
        </p>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar signOut={signOut} />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-3">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onNavClick={() => setSheetOpen(false)} signOut={signOut} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Pill className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Menor Preço</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
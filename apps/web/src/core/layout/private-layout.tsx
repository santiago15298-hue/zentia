import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { MenuIcon } from '../../shared/ui';
import { useSessionStore } from '../auth';
import { visibleNavItems, type NavItem } from '../navigation';
import { BrandMark } from './brand-mark';
import { NavDrawer } from './nav-drawer';
import { PageHeaderSlotContext } from './page-header';

const DRAWER_ID = 'main-nav-drawer';
const GUTTER = 'px-4 md:px-6 lg:px-8';

interface PrivateLayoutProps {
  navItems: readonly NavItem[];
  headerEnd?: ReactNode;
}

export function PrivateLayout({ navItems, headerEnd }: PrivateLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const storeRole = useSessionStore((state) => state.user?.role);
  const mustChangePassword = useSessionStore((state) => state.user?.mustChangePassword ?? false);
  
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('zentia_token');
    const userStr = localStorage.getItem('zentia_user');
    
    if (!token) {
      navigate('/login', { replace: true });
    } else if (userStr) {
      setLocalUser(JSON.parse(userStr));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('zentia_token');
    localStorage.removeItem('zentia_user');
    navigate('/login', { replace: true });
  };

  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const activeRole = localUser?.role || storeRole;
  const items = mustChangePassword ? [] : visibleNavItems(navItems, activeRole);

  if (!localUser) return null;

  return (
    <PageHeaderSlotContext.Provider value={headerSlot}>
      <div className="min-h-screen bg-neutral-100 text-neutral-900">
        <header className="bg-linear-120 from-primary-950 via-primary-800 to-primary-600 text-white">
          <div className={`mx-auto flex h-18 max-w-content items-center gap-3 ${GUTTER}`}>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('layout.nav.open')}
              aria-expanded={drawerOpen}
              aria-controls={DRAWER_ID}
              className="-ml-2 inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10 lg:hidden"
            >
              <MenuIcon />
            </button>
            <BrandMark />
            <nav aria-label={t('layout.nav.label')} className="ml-6 hidden lg:block">
              <ul className="flex items-center gap-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `block whitespace-nowrap rounded-md px-3 py-2 text-body font-medium transition-colors duration-150 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }` 
                      }
                    >
                      {t(item.labelKey)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* LADO DERECHO DEL HEADER (Sin idiomas, solo perfil) */}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-4 pl-4 ml-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold leading-tight">{localUser.name}</span>
                  <span className="text-xs text-white/70">
                    {localUser.role === 'ADMIN' ? 'Administrador' : localUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-center size-8 bg-blue-500 rounded-full font-bold text-sm shadow-sm">
                  {localUser.name.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                  className="hover:bg-white/20 transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
          <div
            ref={setHeaderSlot}
            className={`mx-auto max-w-content pb-6 empty:hidden ${GUTTER}`}
          />
        </header>
        <main className={`mx-auto max-w-content py-6 ${GUTTER}`}>
          <Outlet />
        </main>
        {drawerOpen ? <NavDrawer id={DRAWER_ID} items={items} onClose={closeDrawer} /> : null}
      </div>
    </PageHeaderSlotContext.Provider>
  );
}
import React from 'react';
import { Tent, Heart, Shield, Trees, Compass } from 'lucide-react';
import { useCampsites } from '../context/CampsiteContext';

export const Footer: React.FC = () => {
  const { setView, t } = useCampsites();

  return (
    <footer id="main-footer" className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          
          {/* Brand col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Tent className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white">
                Campy<span className="text-emerald-500">.lt</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-full w-fit">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('launchTag')}</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">{t('explore')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setView('search')} className="hover:text-emerald-400 transition-colors">
                  {t('tent')}
                </button>
              </li>
              <li>
                <button onClick={() => setView('search')} className="hover:text-emerald-400 transition-colors">
                  {t('glamping')}
                </button>
              </li>
              <li>
                <button onClick={() => setView('search')} className="hover:text-emerald-400 transition-colors">
                  {t('rv')}
                </button>
              </li>
            </ul>
          </div>

          {/* Host Land */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">{t('dashboard')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setView('add-listing')} className="hover:text-emerald-400 transition-colors">
                  {t('addListing')}
                </button>
              </li>
              <li>
                <button onClick={() => setView('host-dashboard')} className="hover:text-emerald-400 transition-colors">
                  {t('dashboard')}
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Atsakingas Poilsis</h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Pasisakome už švarią gamtą, gaisrų saugumą ir pagarbą privataus sklypo šeimininkams.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Trees className="w-4 h-4 text-emerald-500" />
              <span>Saugoma Lietuvos Gamta</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Campy.lt Visos teisės saugomos.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Lietuva (LT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

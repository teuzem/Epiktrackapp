import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs, Breadcrumb } from '../../hooks/useBreadcrumbs';

const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3">
          <li>
            <Link to="/" className="text-gray-500 hover:text-primary-600">
              <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Accueil</span>
            </Link>
          </li>
          {breadcrumbs.slice(1).map((breadcrumb, index) => (
            <li key={breadcrumb.path}>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <Link
                  to={breadcrumb.path}
                  className={`ml-2 text-sm font-medium capitalize ${
                    index === breadcrumbs.length - 2
                      ? 'text-gray-800 pointer-events-none'
                      : 'text-gray-500 hover:text-primary-600'
                  }`}
                  aria-current={index === breadcrumbs.length - 2 ? 'page' : undefined}
                >
                  {breadcrumb.name}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

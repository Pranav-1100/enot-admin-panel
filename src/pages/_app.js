import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '@/styles/globals.css';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/common/Layout';
import { PageSpinner } from '@/components/common/LoadingSpinner';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Check if user has admin privileges
  useEffect(() => {
    if (user && !['admin', 'seller'].includes(user.userType)) {
      router.push('/login');
    }
  }, [user, router]);

  if (loading) {
    return <PageSpinner />;
  }

  if (!isAuthenticated) {
    return <PageSpinner />;
  }

  if (user && !['admin', 'seller'].includes(user.userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this admin panel.</p>
        </div>
      </div>
    );
  }

  return children;
}

// App Component
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <>
      <Head>
        <title>E° ENOT Admin Panel</title>
        <meta name="description" content="E° ENOT Admin Panel - Luxury Perfume Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AuthProvider>
        {isLoginPage ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ProtectedRoute>
        )}
      </AuthProvider>
    </>
  );
}

export default MyApp;
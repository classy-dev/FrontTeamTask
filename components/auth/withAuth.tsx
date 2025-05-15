import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthToken } from '../../lib/api/auth';

export function withAuth<P>(WrappedComponent: React.ComponentType<any>): React.FC<P> {
  const WithAuthComponent: React.FC<P> = (props: P) => {
    const router = useRouter();
    const token = getAuthToken();

    useEffect(() => {
      if (!token) {
        router.replace('/login');
      }
    }, [router, token]);

    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // displayName 설정은 여기에서 합니다.
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}

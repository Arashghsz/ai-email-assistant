import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        
        if (!dataParam) {
          throw new Error('No data parameter received');
        }

        const data = JSON.parse(decodeURIComponent(dataParam));
        console.log('Processing auth data:', { 
          hasTokens: !!data?.tokens,
          hasUser: !!data?.user 
        });

        if (!data?.tokens) {
          throw new Error('No tokens received');
        }

        if (mounted) {
          await login(data.tokens, data.user);
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        if (mounted) {
          navigate('/', { 
            replace: true,
            state: { error: 'Authentication failed: ' + error.message } 
          });
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, login, isProcessing]);

  return (
    <div className="auth-callback">
      <div className="loading-spinner">
        <div>Completing authentication...</div>
        <div>Please wait...</div>
      </div>
    </div>
  );
}

export default AuthCallback;

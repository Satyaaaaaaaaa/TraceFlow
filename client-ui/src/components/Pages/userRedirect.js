import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Spinner'; // Import Spinner component

export default function UserRedirect({ token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/user/', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userRole = userData.data.role;

          // Redirect based on user role
          switch (userRole) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'seller':
              navigate('/seller-dashboard');
              break;
            case 'user':
              navigate('/');
              break;
            default:
              console.error('Unexpected user role:', userRole);
              break;
          }
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Set loading to false once fetching is done
      }
    };

    fetchUserData();
  }, [token, navigate]);

  return loading ? <Spinner /> : null; // Show spinner while loading
}

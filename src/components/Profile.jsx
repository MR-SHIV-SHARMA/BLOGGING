import { useUserProfile } from '../context/UserProfile';

function Profile() {
  const { userProfile, updateProfile } = useUserProfile();

  // ... rest of your component code ...
} 
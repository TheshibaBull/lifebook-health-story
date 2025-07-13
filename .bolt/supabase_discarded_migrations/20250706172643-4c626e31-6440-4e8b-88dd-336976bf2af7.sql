-- Create the missing profile for the stuck user
INSERT INTO public.user_profiles (
  id, 
  first_name, 
  last_name, 
  email, 
  profile_completed, 
  account_status
) VALUES (
  '768ee9cb-d372-4256-b901-131acf6ce2d9',
  'User', 
  'User', 
  'ganeshgpb123@gmail.com', 
  false, 
  'active'
) ON CONFLICT (id) DO NOTHING;
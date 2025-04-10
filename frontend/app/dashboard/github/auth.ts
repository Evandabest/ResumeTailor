import { redirect } from 'next/navigation';

export function checkAuth() {
  // Check if running on client side
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      redirect('/login');
    }
  }
}

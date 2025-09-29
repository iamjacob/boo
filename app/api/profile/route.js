import { withAuth } from '../../lib/authMiddleware';
import { NextResponse } from 'next/server';

// Example protected route - user profile
async function profileHandler(request) {
  try {
    // request.user is automatically available from withAuth middleware
    const user = request.user;
    
    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        booksRead: user.booksRead,
        followers: user.followers,
        following: user.following,
        location: user.location,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Export the protected route
export const GET = withAuth(profileHandler);
import Link from "next/link";
import React from "react";

/**
 * A wrapper component that links to a user's public profile.
 * Use this to wrap Avatars or usernames throughout the application.
 */
const ProfileLink = ({ userId, children, className = "" }) => {
  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={`inline-block hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </Link>
  );
};

export default ProfileLink;

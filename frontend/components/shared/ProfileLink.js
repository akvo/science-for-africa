import Link from "next/link";
import React from "react";

/**
 * A wrapper component that links to a user's public profile.
 * Use this to wrap Avatars or usernames throughout the application.
 */
/**
 * A wrapper component that links to a user's public profile.
 * Use this to wrap Avatars or usernames throughout the application.
 */
const ProfileLink = ({ userId, children, className = "" }) => {
  // Supports both numeric IDs (legacy) and Strapi v5 documentIds
  const identifier = userId;

  if (!identifier) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={`/profile/${identifier}`}
      className={`inline-block hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </Link>
  );
};

export default ProfileLink;

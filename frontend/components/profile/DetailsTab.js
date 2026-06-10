import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { updateUserProfile, uploadFile, fetchUserProfile } from "@/lib/strapi";
import { toast } from "sonner";
import DetailsViewMode from "./details/DetailsViewMode";
import DetailsEditMode from "./details/DetailsEditMode";

const DetailsTab = ({ profileUser }) => {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const { user: authUser, updateUser } = useAuthStore();
  const user = profileUser || authUser;

  // For public profile, we never show edit mode
  const isPublic = !!profileUser;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data, setPhotoPreview) => {
    setIsSaving(true);
    // Capture language before updateUserProfile mutates the data object
    const selectedLocale = data.language || data.languagePreferences;
    try {
      // 1. Handle Photo Upload if needed
      if (data.profilePhoto instanceof File) {
        const uploadData = await uploadFile(data.profilePhoto);
        if (uploadData?.[0]?.id) {
          data.profilePhoto = uploadData[0].id;
        }
      }

      // 2. Update Profile
      const response = await updateUserProfile(data);

      // 3. Update Global State
      updateUser(response);

      if (response) {
        toast.success(t("details.save_success"));
        setIsEditing(false);
        setPhotoPreview?.(null);

        // Switch display language if language preference changed
        if (selectedLocale && selectedLocale !== router.locale) {
          const { pathname, query, asPath } = router;
          router.push({ pathname, query }, asPath, { locale: selectedLocale });
        }
      } else {
        toast.error(t("details.save_error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserUpdate = async () => {
    const freshUser = await fetchUserProfile();
    if (freshUser) {
      updateUser(freshUser);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <DetailsEditMode
        user={user}
        t={t}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
        isSaving={isSaving}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <DetailsViewMode
      user={user}
      t={t}
      onEdit={() => setIsEditing(true)}
      onUserUpdate={handleUserUpdate}
      isPublic={isPublic}
    />
  );
};

export default DetailsTab;

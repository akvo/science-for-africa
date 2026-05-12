import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { updateUserProfile, uploadFile, fetchUserProfile } from "@/lib/strapi";
import { toast } from "sonner";
import DetailsViewMode from "./details/DetailsViewMode";
import DetailsEditMode from "./details/DetailsEditMode";

const DetailsTab = ({ profileUser }) => {
  const { t } = useTranslation("profile");
  const { user: authUser, updateUser } = useAuthStore();
  const user = profileUser || authUser;

  // For public profile, we never show edit mode
  const isPublic = !!profileUser;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data, setPhotoPreview) => {
    setIsSaving(true);
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
    />
  );
};

export default DetailsTab;

import { useState, useEffect } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, UserRound } from "lucide-react";
import { fetchFromStrapi } from "@/lib/strapi";
import VerificationBadge from "@/components/shared/VerificationBadge";

export default function StepAssignMentor() {
  const { formData, addMentor, removeMentorById, prevStep, nextStep } =
    useCollaborationStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchFromStrapi("/auth/users");
        if (Array.isArray(response)) {
          setUsers(response);
        } else if (response?.data) {
          setUsers(response.data);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const assignedIds = formData.mentors.map((m) => m.id);
  const availableUsers = users.filter((u) => !assignedIds.includes(u.id));

  const handleAddMentor = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    if (user) {
      addMentor({
        id: user.id,
        email: user.email,
        fullName:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        position: user.position || user.roleType || "",
        verified: user.verified,
      });
      setSelectedUserId("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label>Select</Label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-brand-gray-400 py-3">
            <Loader2 className="size-4 animate-spin" />
            Loading users...
          </div>
        ) : (
          <Select value={selectedUserId} onValueChange={handleAddMentor}>
            <SelectTrigger className="gap-2">
              <UserRound className="size-4 text-brand-gray-400 shrink-0" />
              <SelectValue placeholder="Select a mentor" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {availableUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-brand-gray-400">
                  No users available
                </div>
              ) : (
                availableUsers.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    <div className="flex items-center gap-2">
                      {user.fullName ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                        user.email}
                      <VerificationBadge verified={user.verified} />
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {formData.mentors.length > 0 && (
        <div className="space-y-3">
          {formData.mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="flex items-center gap-3 py-3 border-b border-brand-gray-100 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal-50 text-brand-teal-700 text-sm font-bold">
                {getInitials(mentor.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-gray-900 truncate">
                    {mentor.fullName}
                  </span>
                  <VerificationBadge verified={mentor.verified} />
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    Mentor
                  </Badge>
                </div>
                {mentor.position && (
                  <p className="text-xs text-brand-gray-500 truncate">
                    {mentor.position}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMentorById(mentor.id)}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={prevStep} className="rounded-full">
          Back
        </Button>
        <Button onClick={nextStep} className="rounded-full">
          Next
        </Button>
      </div>
    </div>
  );
}

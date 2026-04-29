import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function CommunityHeader({
  community,
  onCreatePost,
  onJoin,
  isJoined = false,
}) {
  const { t } = useTranslation("common");

  return (
    <div className="w-full">
      <div
        className="h-72 w-full overflow-hidden rounded-b-2xl bg-brand-gray-100 bg-cover bg-center"
        style={
          community.bannerUrl
            ? { backgroundImage: `url(${community.bannerUrl})` }
            : undefined
        }
        role="img"
        aria-label={`${community.name} banner`}
      />

      <div className="flex items-center justify-between gap-4 px-2 pt-4">
        <div className="flex items-center gap-4">
          <Avatar
            size="2xl"
            className="-mt-20 ring-4 ring-white"
            style={{ width: "10rem", height: "10rem" }}
          >
            {community.avatarUrl ? (
              <AvatarImage src={community.avatarUrl} alt={community.name} />
            ) : null}
            <AvatarFallback className="text-4xl">
              {community.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-gray-900">
              {community.name}
            </h1>
            {community.handle ? (
              <p className="text-sm text-brand-gray-500">
                ID: {community.handle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={onCreatePost}>
            {t("community.create_post")}
          </Button>
          <Button variant="primary" size="md" onClick={onJoin}>
            {isJoined ? t("community.joined") : t("community.join")}
          </Button>
        </div>
      </div>
    </div>
  );
}

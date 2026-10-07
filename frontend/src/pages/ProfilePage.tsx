import { Page, PageHeader } from "@/components/shared/Page";

import AvatarUploader from "@/components/profile/AvatarUploader";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";

import { useUser } from "@/context/UserContext";
import usePageTitle from "@/hooks/usePageTitle";

function ProfilePage() {
  usePageTitle("Profile");
  const { user, avatarUrl, refreshUser } = useUser();

  if (!user) {
    return (
      <Page>
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Profile" description="Manage your account settings." />

      <AvatarUploader
        user={user}
        avatarUrl={avatarUrl}
        onUpdated={refreshUser}
      />

      <ProfileForm
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        onUpdated={refreshUser}
      />

      <PasswordForm />
    </Page>
  );
}

export default ProfilePage;

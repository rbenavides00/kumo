import Card from "../components/ui/Card";
import AvatarUploader from "../components/profile/AvatarUploader";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordForm from "../components/profile/PasswordForm";
import { useUser } from "../context/UserContext";

function ProfilePage() {
  const { user, avatarUrl, refreshUser } = useUser();

  if (!user) {
    return (
      <Card>
        <Card.Body>
          <p className="text-sm text-gray-500">Loading profile...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header title="Profile" subtitle="Manage your account settings." />

      <Card.Body className="flex flex-col gap-8">
        <AvatarUploader user={user} avatarUrl={avatarUrl} onUpdated={refreshUser} />

        <ProfileForm
          initialFirstName={user.first_name}
          initialLastName={user.last_name}
          onUpdated={refreshUser}
        />

        <PasswordForm />
      </Card.Body>
    </Card>
  );
}

export default ProfilePage;

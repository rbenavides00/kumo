import Card from "../components/ui/Card";
import usePageTitle from "../hooks/usePageTitle";

function SettingsPage() {
  usePageTitle("Settings");
  return (
    <Card>
      <Card.Header title="Settings" subtitle="Manage your preferences." />
      <Card.Body>
        <p className="text-sm text-gray-500">Sample text</p>
      </Card.Body>
    </Card>
  );
}

export default SettingsPage;

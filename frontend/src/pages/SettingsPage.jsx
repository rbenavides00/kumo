import Card from "../components/ui/Card";

function SettingsPage() {
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

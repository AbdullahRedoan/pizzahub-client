import { RoleGuard } from "@/components/dashboard/dashboard-shell";
import { ProfileSettingsView } from "@/components/dashboard/profile-settings-view";

export default function ProfileSettingsPage() {
  return (
    <RoleGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileSettingsView />
      </div>
    </RoleGuard>
  );
}

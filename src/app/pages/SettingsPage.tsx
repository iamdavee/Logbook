import { toast } from "sonner";

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1>Settings</h1>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="mb-4">Profile Information</h3>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1.5">First Name</label>
              <input type="text" defaultValue="David" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Middle Name</label>
              <input type="text" defaultValue="Ogheneovie" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Last Name</label>
              <input type="text" defaultValue="ADIBITE-DANIEL" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5">Gender</label>
              <select defaultValue="Male" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5">Date of Birth</label>
              <input type="date" defaultValue="2004-05-21" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5">Phone</label>
              <input type="tel" defaultValue="08149601248" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Email</label>
              <input type="email" defaultValue="davidadibitedaniel@gmail.com" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5">New Password</label>
            <input type="password" placeholder="Leave blank to keep current" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

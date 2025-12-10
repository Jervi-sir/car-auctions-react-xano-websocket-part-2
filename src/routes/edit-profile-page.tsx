// src/routes/edit-profile-page.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfileService } from "@/api";
import type { UserProfile } from "@/api";
import axios from "axios";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

export function EditProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        const data = await UserProfileService.getProfile();
        setProfile(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          city: data.city || "",
          country: data.country || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
        console.error("Error fetching profile:", err);
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await UserProfileService.updateProfile(formData);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await UserProfileService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });

      setSuccessMessage("Password updated successfully!");
      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password"
      );
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete account state & handler
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setError(null);
    setSuccessMessage(null);

    if (deleteConfirm !== "DELETE") {
      setError("You must type DELETE in all caps to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete(
        "https://xqrx-tgqf-f4ju.n7e.xano.io/api:4aZ5gqlM/user/account",
        {
          data: {
            current_password: deletePassword,
            confirmation: deleteConfirm,
          },
        }
      );

      // Optionally clear auth/session here if you're storing tokens
      // e.g. authLogout(); or localStorage.clear();

      setShowDeleteModal(false);
      navigate("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Account deletion failed.";
      setError(message);
      console.error("Account deletion error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-xl">
            <h2 className="text-lg font-bold text-destructive">
              Confirm Account Deletion
            </h2>
            <p className="text-sm text-muted-foreground">
              This action is <strong>permanent</strong> and cannot be undone.
              Your auctions, bids, and profile data will be permanently removed.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-password">Current Password</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteConfirm("");
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword || !deleteConfirm}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit Profile
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-green-600 bg-green-600/10 p-4">
            <p className="text-sm font-semibold text-green-600">
              {successMessage}
            </p>
          </div>
        )}

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {profile?.statistics.auctions_posted || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Auctions Posted
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {profile?.statistics.auctions_won || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Auctions Won
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {profile?.statistics.total_bids || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Bids</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info + Change Password as responsive grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Information */}
          <form onSubmit={handleSubmit} className="h-full md:col-span-2">
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+49 123 456 7890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Ain Temouchent"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="mt-auto flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordSubmit} className="h-full">
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

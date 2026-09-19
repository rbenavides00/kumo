import { useState } from "react";

import * as usersApi from "../../api/users";

function ProfileForm({ initialFirstName, initialLastName, onUpdated }) {
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await usersApi.updateProfile(firstName, lastName);
      onUpdated(updatedUser);
      setSuccessMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-800">
        Personal information
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

export default ProfileForm;

import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="section auth-page">
      <div className="auth-form">
        <h1>My Profile</h1>
        <div className="profile-row"><strong>Name:</strong> {user.name}</div>
        <div className="profile-row"><strong>Email:</strong> {user.email}</div>
        <div className="profile-row"><strong>Phone:</strong> {user.phone || "—"}</div>
        <div className="profile-row"><strong>Role:</strong> {user.role}</div>
        {user.address && (
          <div className="profile-row">
            <strong>Address:</strong>{" "}
            {[user.address.house, user.address.street, user.address.city, user.address.state, user.address.pincode]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

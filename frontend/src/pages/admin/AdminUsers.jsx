import { useEffect, useState } from "react";
import api from "../../services/api";
import { RowSkeleton } from "../../components/Skeleton";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => setError("Couldn't load customers."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1>Customers</h1><RowSkeleton count={6} /></div>;

  if (error) {
    return (
      <div className="empty-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Customers</h1>
      <table className="admin-table fade-in">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Total Spent</th></tr></thead>
        <tbody>
          {users.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.role}</td>
              <td>{c.orders}</td>
              <td>₹{c.spent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;

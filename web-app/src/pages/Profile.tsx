import { useEffect, useState } from "react";
import userData from "../test_account_1.json";

interface User {
  username: string;
  password: string;
  email: string;
  organization: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect( () => {
    const fetchUser = async () => {
      setUser(userData);
    };
    fetchUser();
  }, []);

  if(!user){
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Account Information</h1>
      <p>View your organization account details.</p>

      {/* <div className="flex flex-col gap-2 text-left"> */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-xl shadow-md p-6 max-w-xl w-full space-y-4 text-left">
          <div>
            <span className="font-semibold">Username: </span>
            <span>{user.username}</span>
          </div>
          <div>
            <span className="font-semibold">Password: </span>
            <span>{user.password}</span>
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="font-semibold">Organization: </span>
            <span>{user.organization}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
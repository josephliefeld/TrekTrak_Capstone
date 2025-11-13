import { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";

interface User {
  user_id: string; // UUID
  username: string;
  password: string;
  email: string;
  organization: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [editField, setEditField] = useState<keyof User | "">("");
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: currentUser, error: userError } = await supabase.auth.getUser(); // get logged-in user
      if (userError || !currentUser?.user) {
        console.error("Error getting auth user:", userError);
        return;
      }

      const userId = currentUser.user.id; // UUID from Supabase Auth

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data as User);
      }
    };

    fetchUser();
  }, []);

  const updateUser = async (field: keyof User, value: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ [field]: value } as Partial<User>)
      .eq("user_id", user.user_id);

    if (error) {
      console.error("Error updating user:", error);
    } else {
      setUser({ ...user, [field]: value });
      setOpenEditor(false);
      setEditField("");
      setEditText("");
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Account Information</h1>
      <p>View and edit your organization account details.</p>

      <div className="bg-gray-100 rounded-xl shadow-md p-6 max-w-xl w-full space-y-4 text-left">
        <div><strong>Username:</strong> {user.username}</div>
        <div><strong>Password:</strong> {user.password}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Organization:</strong> {user.organization}</div>

        <Button onClick={() => setOpenEditor(true)}>Edit Account</Button>

        {openEditor && (
          <div className="mt-4 space-y-2">
            <Select
              value={editField}
              onValueChange={(value: keyof User) => setEditField(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select field to edit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Account Fields</SelectLabel>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Textarea
              placeholder={`Enter new ${editField}`}
              className="mt-2"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <Button
              onClick={() => {
                if (editField) updateUser(editField, editText);
              }}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

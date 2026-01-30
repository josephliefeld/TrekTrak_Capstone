import { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed } from 'lucide-react';
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
  email: string;
  organization: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [editField, setEditField] = useState<"username" | "password" | "">("");
  const [editText, setEditText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: currentUser, error: userError } = await supabase.auth.getUser(); // get logged-in user
      if (userError || !currentUser?.user) {
        console.error("Error getting auth user:", userError);
        return;
      }

      const userId = currentUser.user.id; // UUID from Supabase Auth

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data as User);
      }
    };

    fetchUser();
  }, []);

  const updateUsername = async (value: string) => {
    if (!user) return;

    if (!user?.user_id) {
      console.error("Cannot update: user_id is missing");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: value }) // this is correct
      .eq("profile_id", user.user_id);

    if (!error) {
      setUser({ ...user, username: value });
      setOpenEditor(false);
      setEditText("");
      setEditField("");
    } else {
      console.error("Error updating username:", error);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = /.{10,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[^A-Za-z0-9]/;
  
    if (!minLength.test(password)) return "Password must be at least 10 characters long.";
    if (!upper.test(password)) return "Password must contain at least one uppercase letter.";
    if (!lower.test(password)) return "Password must contain at least one lowercase letter.";
    if (!number.test(password)) return "Password must contain at least one number.";
    if (!special.test(password)) return "Password must contain at least one special character.";
  
    return null; // valid password
  };

  const updatePassword = async (value: string) => {
    const validationError = validatePassword(value);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: value });

    if (error) {
      setErrorMessage(error.message);
      return;
    }
  
    setOpenEditor(false);
    setEditText("");
    setEditField("");
    setErrorMessage("");
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          Account Information
        </h1>
        <p className="text-gray-700">View and edit your organization account details.</p>

        <div className="bg-gray-100 rounded-xl shadow-inner p-6 space-y-4 text-left">
          <div><strong>Username:</strong> {user.username}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Organization:</strong> {user.organization}</div>

          <Button onClick={() => setOpenEditor(true)}>Edit Account</Button>

          {openEditor && (
            <div className="mt-4 space-y-4">
              <Select
                value={editField}
                onValueChange={(value) => {
                  setEditField(value as "username" | "password");
                  setErrorMessage("");   // resets validation errors when switching fields
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select field to edit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Account Fields</SelectLabel>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {editField === "username" && (
                <input
                  type="text"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                  placeholder="Enter new username"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              )}

              {editField === "password" && (
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="border border-gray-300 rounded-xl p-3 w-full pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    placeholder="Enter new password"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
              
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}

              <Button
                onClick={() => {
                  if (!editField || !editText) return;
                  
                  if (editField === "username") updateUsername(editText);
                  if (editField === "password") updatePassword(editText);
                }}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import { Link, useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/components/lib/supabase/client'
import { useAuth } from '../context/AuthContext'

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
//   NavigationMenuTrigger,
//   NavigationMenuContent
} from "@/components/ui/navigation-menu";

const TopNav: React.FC = () => {
    const { setIsLoggedIn } = useAuth()
    const navigate = useNavigate()
 
//   return (
//     <NavigationMenu>
//       <NavigationMenuList>
//         {navItems.map((item) => (
//           <NavigationMenuItem key={item.to}>
//             <NavigationMenuLink asChild>
//               <Link
//                 to={item.to}
//                 className={`px-4 py-2 rounded-md ${
//                   pathname === item.to
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             </NavigationMenuLink>
//           </NavigationMenuItem>
//         ))}
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// };
    return (
        <>
            <NavigationMenu>
                <NavigationMenuList className="flex gap-6">
                    {/* Events tab */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link to="/" onClick={() => {console.log("Clicked Events")}}>Events</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* Create Tab */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link to="/create" onClick={() => {console.log("Clicked Create")}}>Create</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* Profile Tab */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <Link to="/profile" onClick={() => {console.log("Clicked Profile")}}>Profile</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    {/* Logout Button */}
                    <NavigationMenuItem>
                        <NavigationMenuLink>
                            <button onClick={async () => {const { error } = await supabase.auth.signOut()
                                    if (error) {
                                        console.error('Error logging out:', error.message)
                                        return
                                    }
                                    // Update auth context
                                    setIsLoggedIn(false)
                                    // Navigate to home
                                    navigate('/')
                                }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Log Out
                            </button>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </>
    );
};

export default TopNav;
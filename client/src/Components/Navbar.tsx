import {
    NavigationMenu,
    // NavigationMenuContent,
    // NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
    // NavigationMenuTrigger,
    // NavigationMenuViewport,
  } 
  from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Navbar = () =>{
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem> 
                    <Link to="/">
                        <NavigationMenuLink  className={navigationMenuTriggerStyle()} > Home </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link to="/search">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} > Search </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default Navbar
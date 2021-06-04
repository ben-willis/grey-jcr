import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";

interface MenuItem {
    name: string;
    label: string;
    icon: SemanticICONS;
    usersOnly: boolean;
    path: string;
}

const menuItems: MenuItem[] = [
    {
        name: "home",
        label: "Home",
        icon: "home",
        usersOnly: false,
        path: "/",
    },
    {
        name: "jcr",
        label: "JCR",
        icon: "users",
        usersOnly: false,
        path: "https://services.greyjcr.com/jcr/committees",
    },
    {
        name: "sportsandsocs",
        label: "Sport/Socs",
        icon: "soccer",
        usersOnly: false,
        path: "/sportsandsocs",
    },
    {
        name: "events",
        label: "Events",
        icon: "calendar alternate outline",
        usersOnly: false,
        path: "https://services.greyjcr.com/events",
    },
    {
        name: "welfare",
        label: "Welfare",
        icon: "heart",
        usersOnly: false,
        path: "https://services.greyjcr.com/welfare",
    },
    {
        name: "shop",
        label: "Shop",
        icon: "shopping bag",
        usersOnly: false,
        path: "https://services.greyjcr.com/"
    },
    {
        name: "toasties",
        label: "Toastie Bar",
        icon: "food",
        usersOnly: false,
        path: "https://services.greyjcr.com/toasties"
    },
    {
        name: "reps",
        label: "Reps",
        icon: "user circle",
        usersOnly: false,
        path: "https://services.greyjcr.com/jcr/committees?committee=representatives",
    },
    {
        name: "feedback",
        label: "Feedback",
        icon: "comments",
        usersOnly: true,
        path: "https://services.greyjcr.com/feedback",
    },
    {
        name: "mcr",
        label: "MCR",
        icon: "users",
        usersOnly: false,
        path: "/mcr",
    },
    {
        name: "facilities",
        label: "Facilities",
        icon: "bar",
        usersOnly: false,
        path: "/facilities",
    },
    {
        name: "room-booking",
        label: "Room Booking",
        icon: "book",
        usersOnly: false,
        path: "https://services.greyjcr.com/bookings",
    },
    {
        name: "elections",
        label: "Elections",
        icon: "check square outline",
        usersOnly: true,
        path: "https://services.greyjcr.com/elections",
    },
    {
        name: "tech",
        label: "Tech",
        icon: "cogs",
        usersOnly: false,
        path: "/tech",
    },
    {
        name: "menus",
        label: "Menus",
        icon: "utensils",
        usersOnly: false,
        path: "/info/menus",
    },
    {
        name: "admin",
        label: "Admin",
        icon: "wrench",
        usersOnly: true,
        path: "/admin/",
    }
]

export default menuItems;

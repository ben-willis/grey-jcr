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
        path: "/jcr",
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
        path: "/events",
    },
    {
        name: "welfare",
        label: "Welfare",
        icon: "heart",
        usersOnly: false,
        path: "/welfare",
    },
    {
        name: "reps",
        label: "Reps",
        icon: "user circle",
        usersOnly: false,
        path: "/reps",
    },
    {
        name: "feedback",
        label: "Feedback",
        icon: "comments",
        usersOnly: true,
        path: "/services/feedback",
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
        path: "/services/rooms",
    },
    {
        name: "elections",
        label: "Elections",
        icon: "check square outline",
        usersOnly: true,
        path: "/services/elections",
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

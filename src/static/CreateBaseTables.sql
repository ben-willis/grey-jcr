--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.11
-- Dumped by pg_dump version 10.5

-- Started on 2019-02-01 21:32:04

--
-- TOC entry 226 (class 1259 OID 17303)
-- Name: blog_hearts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_hearts (
    username character varying(6),
    blog_id integer
);


--
-- TOC entry 195 (class 1259 OID 17001)
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    message text,
    updated timestamp with time zone DEFAULT now(),
    role_id integer,
    author character varying(6)
);


--
-- TOC entry 194 (class 1259 OID 16999)
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2419 (class 0 OID 0)
-- Dependencies: 194
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- TOC entry 213 (class 1259 OID 17181)
-- Name: booking_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_choices (
    booking_id integer,
    choice_id integer
);


--
-- TOC entry 212 (class 1259 OID 17152)
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    username character varying(6),
    guestname text,
    notes text,
    event_id integer,
    ticket_id integer,
    booked_by character varying(6)
);


--
-- TOC entry 211 (class 1259 OID 17150)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2420 (class 0 OID 0)
-- Dependencies: 211
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 190 (class 1259 OID 16957)
-- Name: debts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debts (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    message text,
    link text,
    amount integer DEFAULT 0,
    debt_added timestamp with time zone DEFAULT now(),
    username character varying(6),
    booking_id integer
);


--
-- TOC entry 189 (class 1259 OID 16955)
-- Name: debts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.debts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2421 (class 0 OID 0)
-- Dependencies: 189
-- Name: debts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.debts_id_seq OWNED BY public.debts.id;


--
-- TOC entry 219 (class 1259 OID 17230)
-- Name: election_position_nominees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.election_position_nominees (
    id integer NOT NULL,
    name text NOT NULL,
    manifesto text,
    position_id integer
);


--
-- TOC entry 218 (class 1259 OID 17228)
-- Name: election_position_nominees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.election_position_nominees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2422 (class 0 OID 0)
-- Dependencies: 218
-- Name: election_position_nominees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.election_position_nominees_id_seq OWNED BY public.election_position_nominees.id;


--
-- TOC entry 217 (class 1259 OID 17214)
-- Name: election_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.election_positions (
    id integer NOT NULL,
    name text NOT NULL,
    election_id integer
);


--
-- TOC entry 216 (class 1259 OID 17212)
-- Name: election_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.election_positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2423 (class 0 OID 0)
-- Dependencies: 216
-- Name: election_positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.election_positions_id_seq OWNED BY public.election_positions.id;


--
-- TOC entry 221 (class 1259 OID 17246)
-- Name: election_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.election_votes (
    id integer NOT NULL,
    election_id integer,
    position_id integer,
    nominee_id integer,
    preference character varying(255) NOT NULL,
    usercode character varying(255) NOT NULL,
    username character varying(6)
);


--
-- TOC entry 220 (class 1259 OID 17244)
-- Name: election_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.election_votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2424 (class 0 OID 0)
-- Dependencies: 220
-- Name: election_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.election_votes_id_seq OWNED BY public.election_votes.id;


--
-- TOC entry 215 (class 1259 OID 17202)
-- Name: elections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.elections (
    id integer NOT NULL,
    name text NOT NULL,
    status integer DEFAULT 0
);


--
-- TOC entry 2425 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN elections.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.elections.status IS '0:closed, 1:public, 2:open';


--
-- TOC entry 214 (class 1259 OID 17200)
-- Name: elections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.elections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2426 (class 0 OID 0)
-- Dependencies: 214
-- Name: elections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.elections_id_seq OWNED BY public.elections.id;


--
-- TOC entry 206 (class 1259 OID 17109)
-- Name: event_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_tickets (
    event_id integer,
    ticket_id integer
);


--
-- TOC entry 203 (class 1259 OID 17079)
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "time" timestamp with time zone DEFAULT now()
);


--
-- TOC entry 202 (class 1259 OID 17077)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2427 (class 0 OID 0)
-- Dependencies: 202
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 201 (class 1259 OID 17057)
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedbacks (
    id integer NOT NULL,
    author character varying(6),
    title text NOT NULL,
    message text NOT NULL,
    parent_id integer,
    exec boolean,
    anonymous boolean,
    archived boolean,
    read_by_user boolean,
    created timestamp with time zone DEFAULT now()
);


--
-- TOC entry 200 (class 1259 OID 17055)
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feedbacks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2428 (class 0 OID 0)
-- Dependencies: 200
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;


--
-- TOC entry 199 (class 1259 OID 17040)
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    path text NOT NULL,
    folder_id integer,
    updated timestamp with time zone DEFAULT now()
);


--
-- TOC entry 198 (class 1259 OID 17038)
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2429 (class 0 OID 0)
-- Dependencies: 198
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- TOC entry 197 (class 1259 OID 17023)
-- Name: folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folders (
    id integer NOT NULL,
    name text NOT NULL,
    parent_id integer DEFAULT 0,
    owner integer
);


--
-- TOC entry 196 (class 1259 OID 17021)
-- Name: folders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.folders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2430 (class 0 OID 0)
-- Dependencies: 196
-- Name: folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.folders_id_seq OWNED BY public.folders.id;

--
-- TOC entry 192 (class 1259 OID 16975)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    title character varying(255),
    description text,
    level integer DEFAULT 0,
    slug character varying(255) NOT NULL
);


--
-- TOC entry 191 (class 1259 OID 16973)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2432 (class 0 OID 0)
-- Dependencies: 191
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 225 (class 1259 OID 17288)
-- Name: room_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_bookings (
    id integer NOT NULL,
    room_id integer,
    name text NOT NULL,
    notes text,
    start_time timestamp with time zone NOT NULL,
    duration integer DEFAULT 60,
    added timestamp with time zone DEFAULT now(),
    status integer DEFAULT 0,
    username character varying(6)
);


--
-- TOC entry 2433 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN room_bookings.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_bookings.status IS '0:pending, 1:accepted, 2:rejected';


--
-- TOC entry 224 (class 1259 OID 17286)
-- Name: room_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2434 (class 0 OID 0)
-- Dependencies: 224
-- Name: room_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_bookings_id_seq OWNED BY public.room_bookings.id;


--
-- TOC entry 223 (class 1259 OID 17277)
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


--
-- TOC entry 222 (class 1259 OID 17275)
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2435 (class 0 OID 0)
-- Dependencies: 222
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- TOC entry 228 (class 1259 OID 17341)
-- Name: societies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.societies (
    id integer NOT NULL,
    type integer,
    name character varying(255),
    description text,
    facebook text,
    twitter text,
    email text,
    slug character varying(255) NOT NULL
);


--
-- TOC entry 2436 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN societies.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.societies.type IS '0: society, 1: sport';


--
-- TOC entry 227 (class 1259 OID 17339)
-- Name: societies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.societies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2437 (class 0 OID 0)
-- Dependencies: 227
-- Name: societies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.societies_id_seq OWNED BY public.societies.id;


--
-- TOC entry 210 (class 1259 OID 17138)
-- Name: ticket_option_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_option_choices (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price integer DEFAULT 0,
    option_id integer
);


--
-- TOC entry 209 (class 1259 OID 17136)
-- Name: ticket_option_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_option_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2438 (class 0 OID 0)
-- Dependencies: 209
-- Name: ticket_option_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_option_choices_id_seq OWNED BY public.ticket_option_choices.id;


--
-- TOC entry 208 (class 1259 OID 17125)
-- Name: ticket_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_options (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    ticket_id integer
);


--
-- TOC entry 207 (class 1259 OID 17123)
-- Name: ticket_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2439 (class 0 OID 0)
-- Dependencies: 207
-- Name: ticket_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_options_id_seq OWNED BY public.ticket_options.id;


--
-- TOC entry 205 (class 1259 OID 17091)
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    name text NOT NULL,
    max_booking integer DEFAULT 8,
    min_booking integer DEFAULT 1,
    allow_debtors boolean DEFAULT false,
    allow_guests boolean DEFAULT false,
    open_booking timestamp with time zone DEFAULT now(),
    close_booking timestamp with time zone DEFAULT now(),
    price integer DEFAULT 0,
    guest_surcharge integer DEFAULT 0,
    stock integer DEFAULT 0
);


--
-- TOC entry 204 (class 1259 OID 17089)
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2440 (class 0 OID 0)
-- Dependencies: 204
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- TOC entry 193 (class 1259 OID 16985)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    username character varying(6),
    role_id integer
);


--
-- TOC entry 188 (class 1259 OID 16947)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    username character varying(6) NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    last_login timestamp with time zone DEFAULT now()
);


--
-- TOC entry 230 (class 1259 OID 17352)
-- Name: valentines_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valentines_pairs (
    id integer NOT NULL,
    lead character varying(255),
    partner character varying(255),
    "position" integer,
    value integer DEFAULT 50
);


--
-- TOC entry 229 (class 1259 OID 17350)
-- Name: valentines_pairs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.valentines_pairs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2441 (class 0 OID 0)
-- Dependencies: 229
-- Name: valentines_pairs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.valentines_pairs_id_seq OWNED BY public.valentines_pairs.id;


--
-- TOC entry 233 (class 1259 OID 17387)
-- Name: valentines_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valentines_status (
    open boolean,
    updated timestamp with time zone DEFAULT now()
);


--
-- TOC entry 232 (class 1259 OID 17364)
-- Name: valentines_swaps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valentines_swaps (
    id integer NOT NULL,
    paira_id integer,
    pairb_id integer,
    username character varying(6),
    created timestamp with time zone DEFAULT now(),
    cost integer DEFAULT 0
);


--
-- TOC entry 231 (class 1259 OID 17362)
-- Name: valentines_swaps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.valentines_swaps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2442 (class 0 OID 0)
-- Dependencies: 231
-- Name: valentines_swaps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.valentines_swaps_id_seq OWNED BY public.valentines_swaps.id;


--
-- TOC entry 2174 (class 2604 OID 17004)
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- TOC entry 2197 (class 2604 OID 17155)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 2169 (class 2604 OID 16960)
-- Name: debts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts ALTER COLUMN id SET DEFAULT nextval('public.debts_id_seq'::regclass);


--
-- TOC entry 2201 (class 2604 OID 17233)
-- Name: election_position_nominees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_position_nominees ALTER COLUMN id SET DEFAULT nextval('public.election_position_nominees_id_seq'::regclass);


--
-- TOC entry 2200 (class 2604 OID 17217)
-- Name: election_positions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_positions ALTER COLUMN id SET DEFAULT nextval('public.election_positions_id_seq'::regclass);


--
-- TOC entry 2202 (class 2604 OID 17249)
-- Name: election_votes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes ALTER COLUMN id SET DEFAULT nextval('public.election_votes_id_seq'::regclass);


--
-- TOC entry 2198 (class 2604 OID 17205)
-- Name: elections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elections ALTER COLUMN id SET DEFAULT nextval('public.elections_id_seq'::regclass);


--
-- TOC entry 2182 (class 2604 OID 17082)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 2180 (class 2604 OID 17060)
-- Name: feedbacks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);


--
-- TOC entry 2178 (class 2604 OID 17043)
-- Name: files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- TOC entry 2176 (class 2604 OID 17026)
-- Name: folders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders ALTER COLUMN id SET DEFAULT nextval('public.folders_id_seq'::regclass);


--
-- TOC entry 2172 (class 2604 OID 16978)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 2204 (class 2604 OID 17291)
-- Name: room_bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_bookings ALTER COLUMN id SET DEFAULT nextval('public.room_bookings_id_seq'::regclass);


--
-- TOC entry 2203 (class 2604 OID 17280)
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- TOC entry 2208 (class 2604 OID 17344)
-- Name: societies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies ALTER COLUMN id SET DEFAULT nextval('public.societies_id_seq'::regclass);


--
-- TOC entry 2195 (class 2604 OID 17141)
-- Name: ticket_option_choices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_option_choices ALTER COLUMN id SET DEFAULT nextval('public.ticket_option_choices_id_seq'::regclass);


--
-- TOC entry 2194 (class 2604 OID 17128)
-- Name: ticket_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_options ALTER COLUMN id SET DEFAULT nextval('public.ticket_options_id_seq'::regclass);


--
-- TOC entry 2184 (class 2604 OID 17094)
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- TOC entry 2209 (class 2604 OID 17355)
-- Name: valentines_pairs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_pairs ALTER COLUMN id SET DEFAULT nextval('public.valentines_pairs_id_seq'::regclass);


--
-- TOC entry 2211 (class 2604 OID 17367)
-- Name: valentines_swaps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_swaps ALTER COLUMN id SET DEFAULT nextval('public.valentines_swaps_id_seq'::regclass);


--
-- TOC entry 2225 (class 2606 OID 17010)
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- TOC entry 2242 (class 2606 OID 17160)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 2220 (class 2606 OID 16967)
-- Name: debts debts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_pkey PRIMARY KEY (id);


--
-- TOC entry 2249 (class 2606 OID 17238)
-- Name: election_position_nominees election_position_nominees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_position_nominees
    ADD CONSTRAINT election_position_nominees_pkey PRIMARY KEY (id);


--
-- TOC entry 2247 (class 2606 OID 17222)
-- Name: election_positions election_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_positions
    ADD CONSTRAINT election_positions_pkey PRIMARY KEY (id);


--
-- TOC entry 2251 (class 2606 OID 17254)
-- Name: election_votes election_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes
    ADD CONSTRAINT election_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 2245 (class 2606 OID 17211)
-- Name: elections elections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elections
    ADD CONSTRAINT elections_pkey PRIMARY KEY (id);


--
-- TOC entry 2233 (class 2606 OID 17088)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 2231 (class 2606 OID 17066)
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- TOC entry 2229 (class 2606 OID 17049)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- TOC entry 2227 (class 2606 OID 17032)
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- TOC entry 2222 (class 2606 OID 16984)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 2255 (class 2606 OID 17297)
-- Name: room_bookings room_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_bookings
    ADD CONSTRAINT room_bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 2253 (class 2606 OID 17285)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 2258 (class 2606 OID 17349)
-- Name: societies societies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_pkey PRIMARY KEY (id);


--
-- TOC entry 2240 (class 2606 OID 17144)
-- Name: ticket_option_choices ticket_option_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_option_choices
    ADD CONSTRAINT ticket_option_choices_pkey PRIMARY KEY (id);


--
-- TOC entry 2238 (class 2606 OID 17130)
-- Name: ticket_options ticket_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_options
    ADD CONSTRAINT ticket_options_pkey PRIMARY KEY (id);


--
-- TOC entry 2235 (class 2606 OID 17108)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 2218 (class 2606 OID 16954)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- TOC entry 2260 (class 2606 OID 17361)
-- Name: valentines_pairs valentines_pairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_pairs
    ADD CONSTRAINT valentines_pairs_pkey PRIMARY KEY (id);


--
-- TOC entry 2262 (class 2606 OID 17371)
-- Name: valentines_swaps valentines_swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_swaps
    ADD CONSTRAINT valentines_swaps_pkey PRIMARY KEY (id);


--
-- TOC entry 2256 (class 1259 OID 17316)
-- Name: blog_hearts_username_blog_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_hearts_username_blog_id_index ON public.blog_hearts USING btree (username, blog_id);


--
-- TOC entry 2243 (class 1259 OID 17194)
-- Name: booking_choices_booking_id_choice_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX booking_choices_booking_id_choice_id_index ON public.booking_choices USING btree (booking_id, choice_id);


--
-- TOC entry 2236 (class 1259 OID 17122)
-- Name: event_tickets_event_id_ticket_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_tickets_event_id_ticket_id_index ON public.event_tickets USING btree (event_id, ticket_id);


--
-- TOC entry 2223 (class 1259 OID 16998)
-- Name: user_roles_username_role_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_username_role_id_index ON public.user_roles USING btree (username, role_id);


--
-- TOC entry 2292 (class 2606 OID 17311)
-- Name: blog_hearts blog_hearts_blog_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_hearts
    ADD CONSTRAINT blog_hearts_blog_id_foreign FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE;


--
-- TOC entry 2291 (class 2606 OID 17306)
-- Name: blog_hearts blog_hearts_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_hearts
    ADD CONSTRAINT blog_hearts_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE SET NULL;


--
-- TOC entry 2268 (class 2606 OID 17016)
-- Name: blogs blogs_author_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_author_foreign FOREIGN KEY (author) REFERENCES public.users(username) ON DELETE SET NULL;


--
-- TOC entry 2267 (class 2606 OID 17011)
-- Name: blogs blogs_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- TOC entry 2281 (class 2606 OID 17184)
-- Name: booking_choices booking_choices_booking_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_choices
    ADD CONSTRAINT booking_choices_booking_id_foreign FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 2282 (class 2606 OID 17189)
-- Name: booking_choices booking_choices_choice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_choices
    ADD CONSTRAINT booking_choices_choice_id_foreign FOREIGN KEY (choice_id) REFERENCES public.ticket_option_choices(id) ON DELETE CASCADE;


--
-- TOC entry 2280 (class 2606 OID 17176)
-- Name: bookings bookings_booked_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booked_by_foreign FOREIGN KEY (booked_by) REFERENCES public.users(username) ON DELETE SET NULL;


--
-- TOC entry 2278 (class 2606 OID 17166)
-- Name: bookings bookings_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 2279 (class 2606 OID 17171)
-- Name: bookings bookings_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 2277 (class 2606 OID 17161)
-- Name: bookings bookings_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 2263 (class 2606 OID 17195)
-- Name: debts debts_booking_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_booking_id_foreign FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- TOC entry 2264 (class 2606 OID 16968)
-- Name: debts debts_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 2284 (class 2606 OID 17239)
-- Name: election_position_nominees election_position_nominees_position_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_position_nominees
    ADD CONSTRAINT election_position_nominees_position_id_foreign FOREIGN KEY (position_id) REFERENCES public.election_positions(id) ON DELETE CASCADE;


--
-- TOC entry 2283 (class 2606 OID 17223)
-- Name: election_positions election_positions_election_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_positions
    ADD CONSTRAINT election_positions_election_id_foreign FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE CASCADE;


--
-- TOC entry 2285 (class 2606 OID 17255)
-- Name: election_votes election_votes_election_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes
    ADD CONSTRAINT election_votes_election_id_foreign FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE CASCADE;


--
-- TOC entry 2287 (class 2606 OID 17265)
-- Name: election_votes election_votes_nominee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes
    ADD CONSTRAINT election_votes_nominee_id_foreign FOREIGN KEY (nominee_id) REFERENCES public.election_position_nominees(id) ON DELETE CASCADE;


--
-- TOC entry 2286 (class 2606 OID 17260)
-- Name: election_votes election_votes_position_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes
    ADD CONSTRAINT election_votes_position_id_foreign FOREIGN KEY (position_id) REFERENCES public.election_positions(id) ON DELETE CASCADE;


--
-- TOC entry 2288 (class 2606 OID 17270)
-- Name: election_votes election_votes_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_votes
    ADD CONSTRAINT election_votes_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE SET NULL;


--
-- TOC entry 2273 (class 2606 OID 17112)
-- Name: event_tickets event_tickets_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tickets
    ADD CONSTRAINT event_tickets_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 2274 (class 2606 OID 17117)
-- Name: event_tickets event_tickets_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tickets
    ADD CONSTRAINT event_tickets_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 2271 (class 2606 OID 17067)
-- Name: feedbacks feedbacks_author_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_author_foreign FOREIGN KEY (author) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 2272 (class 2606 OID 17072)
-- Name: feedbacks feedbacks_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.feedbacks(id) ON DELETE CASCADE;


--
-- TOC entry 2270 (class 2606 OID 17050)
-- Name: files files_folder_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_folder_id_foreign FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- TOC entry 2269 (class 2606 OID 17033)
-- Name: folders folders_owner_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_owner_foreign FOREIGN KEY (owner) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 2289 (class 2606 OID 17298)
-- Name: room_bookings room_bookings_room_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_bookings
    ADD CONSTRAINT room_bookings_room_id_foreign FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- TOC entry 2290 (class 2606 OID 17334)
-- Name: room_bookings room_bookings_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_bookings
    ADD CONSTRAINT room_bookings_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 2276 (class 2606 OID 17145)
-- Name: ticket_option_choices ticket_option_choices_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_option_choices
    ADD CONSTRAINT ticket_option_choices_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.ticket_options(id) ON DELETE CASCADE;


--
-- TOC entry 2275 (class 2606 OID 17131)
-- Name: ticket_options ticket_options_ticket_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_options
    ADD CONSTRAINT ticket_options_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 2266 (class 2606 OID 16993)
-- Name: user_roles user_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 2265 (class 2606 OID 16988)
-- Name: user_roles user_roles_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 2293 (class 2606 OID 17372)
-- Name: valentines_swaps valentines_swaps_paira_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_swaps
    ADD CONSTRAINT valentines_swaps_paira_id_foreign FOREIGN KEY (paira_id) REFERENCES public.valentines_pairs(id) ON DELETE CASCADE;


--
-- TOC entry 2294 (class 2606 OID 17377)
-- Name: valentines_swaps valentines_swaps_pairb_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_swaps
    ADD CONSTRAINT valentines_swaps_pairb_id_foreign FOREIGN KEY (pairb_id) REFERENCES public.valentines_pairs(id) ON DELETE CASCADE;


--
-- TOC entry 2295 (class 2606 OID 17382)
-- Name: valentines_swaps valentines_swaps_username_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valentines_swaps
    ADD CONSTRAINT valentines_swaps_username_foreign FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE SET NULL;


-- Completed on 2019-02-01 21:32:04

--
-- PostgreSQL database dump complete
--


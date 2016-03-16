--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: blog; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE blog (
    id integer NOT NULL,
    author character(6),
    positionid integer,
    title text NOT NULL,
    message text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    slug text
);


ALTER TABLE public.blog OWNER TO grey;

--
-- Name: blog_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE blog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blog_id_seq OWNER TO grey;

--
-- Name: blog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE blog_id_seq OWNED BY blog.id;


--
-- Name: election_nominations; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE election_nominations (
    id integer NOT NULL,
    positionid integer,
    name text NOT NULL,
    manifesto text,
    electionid integer
);


ALTER TABLE public.election_nominations OWNER TO grey;

--
-- Name: election_nominations_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE election_nominations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.election_nominations_id_seq OWNER TO grey;

--
-- Name: election_nominations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE election_nominations_id_seq OWNED BY election_nominations.id;


--
-- Name: election_positions; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE election_positions (
    id integer NOT NULL,
    name text NOT NULL,
    electionid integer
);


ALTER TABLE public.election_positions OWNER TO grey;

--
-- Name: election_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE election_positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.election_positions_id_seq OWNER TO grey;

--
-- Name: election_positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE election_positions_id_seq OWNED BY election_positions.id;


--
-- Name: election_votes; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE election_votes (
    id integer NOT NULL,
    username character(6),
    nominationid integer,
    value integer,
    electionid integer
);


ALTER TABLE public.election_votes OWNER TO grey;

--
-- Name: election_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE election_votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.election_votes_id_seq OWNER TO grey;

--
-- Name: election_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE election_votes_id_seq OWNED BY election_votes.id;


--
-- Name: elections; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE elections (
    id integer NOT NULL,
    title text NOT NULL,
    status integer DEFAULT 0
);


ALTER TABLE public.elections OWNER TO grey;

--
-- Name: elections_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE elections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.elections_id_seq OWNER TO grey;

--
-- Name: elections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE elections_id_seq OWNED BY elections.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE events (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    description text,
    image text
);


ALTER TABLE public.events OWNER TO grey;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO grey;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE events_id_seq OWNED BY events.id;


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE feedback (
    id integer NOT NULL,
    author character(6),
    title text,
    message text,
    parentid integer,
    exec boolean,
    "timestamp" timestamp without time zone DEFAULT now(),
    anonymous boolean
);


ALTER TABLE public.feedback OWNER TO grey;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.feedback_id_seq OWNER TO grey;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE feedback_id_seq OWNED BY feedback.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE positions (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    description text,
    level smallint DEFAULT 0,
    slug character varying(50)
);


ALTER TABLE public.positions OWNER TO grey;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.positions_id_seq OWNER TO grey;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE positions_id_seq OWNED BY positions.id;


--
-- Name: userpositions; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE userpositions (
    id integer NOT NULL,
    username character(6),
    "position" integer
);


ALTER TABLE public.userpositions OWNER TO grey;

--
-- Name: userpositions_id_seq; Type: SEQUENCE; Schema: public; Owner: grey
--

CREATE SEQUENCE userpositions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.userpositions_id_seq OWNER TO grey;

--
-- Name: userpositions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: grey
--

ALTER SEQUENCE userpositions_id_seq OWNED BY userpositions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: grey; Tablespace: 
--

CREATE TABLE users (
    username character(6) NOT NULL,
    email character varying(50) NOT NULL,
    name text
);


ALTER TABLE public.users OWNER TO grey;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY blog ALTER COLUMN id SET DEFAULT nextval('blog_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_nominations ALTER COLUMN id SET DEFAULT nextval('election_nominations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_positions ALTER COLUMN id SET DEFAULT nextval('election_positions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_votes ALTER COLUMN id SET DEFAULT nextval('election_votes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY elections ALTER COLUMN id SET DEFAULT nextval('elections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY events ALTER COLUMN id SET DEFAULT nextval('events_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY feedback ALTER COLUMN id SET DEFAULT nextval('feedback_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY positions ALTER COLUMN id SET DEFAULT nextval('positions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: grey
--

ALTER TABLE ONLY userpositions ALTER COLUMN id SET DEFAULT nextval('userpositions_id_seq'::regclass);


--
-- Data for Name: blog; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY blog (id, author, positionid, title, message, "timestamp", slug) FROM stdin;
1	hsdz38	1	Welcome to the new Grey JCR Website!	<p>Aliquam mauris ligula, placerat sed risus at, vestibulum porttitor mi. Nullam eget fringilla nisi, sit amet posuere mi. Quisque id lacus sed leo varius rhoncus. Donec sed dui a nisl rutrum lacinia. Quisque eu maximus elit, id pretium purus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi dignissim aliquet quam, sit amet eleifend urna condimentum in. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sagittis quam non velit ultrices lacinia. Phasellus hendrerit congue odio non placerat. Curabitur iaculis velit vestibulum volutpat maximus.</p>\r\n\r\n<p><img alt="" src="http://testing.greyjcr.com/uploads/slides/1422627261-slide2.jpg" style="height:307px; width:647px" /></p>\r\n\r\n<p>Fusce vehicula risus sit amet commodo lacinia. Mauris varius neque at felis ornare finibus. In sed justo placerat, consectetur nibh a, laoreet sem. Mauris ac fringilla urna, ut mattis est. Pellentesque finibus nunc nisl, ac sagittis tortor venenatis eget. In pretium odio lectus, eget blandit lorem sagittis at. Phasellus nec sapien id nibh dapibus rhoncus eu vel justo.</p>\r\n	2016-02-28 16:46:53.951858	first
\.


--
-- Name: blog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('blog_id_seq', 3, true);


--
-- Data for Name: election_nominations; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY election_nominations (id, positionid, name, manifesto, electionid) FROM stdin;
2	2	Ben Willis	ben-willisFkFY.pdf	2
4	2	Test Person	\N	2
5	4	Barry Chuckle	\N	2
6	4	Paul Chuckle	\N	2
7	2	RON	\N	2
8	4	RON	\N	2
\.


--
-- Name: election_nominations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('election_nominations_id_seq', 8, true);


--
-- Data for Name: election_positions; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY election_positions (id, name, electionid) FROM stdin;
2	Vice President	2
4	Another Position	2
\.


--
-- Name: election_positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('election_positions_id_seq', 4, true);


--
-- Data for Name: election_votes; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY election_votes (id, username, nominationid, value, electionid) FROM stdin;
1	hsdz38	2	0	2
2	hsdz38	4	0	2
3	hsdz38	7	1	2
4	hsdz38	5	1	2
5	hsdz38	6	2	2
6	hsdz38	8	0	2
7	mzqb55	2	1	2
8	mzqb55	4	2	2
9	mzqb55	7	4	2
10	mzqb55	5	3	2
11	mzqb55	6	1	2
12	mzqb55	8	2	2
13	msnz42	2	2	2
14	msnz42	4	1	2
15	msnz42	7	1	2
16	msnz42	5	1	2
17	msnz42	6	2	2
18	msnz42	8	3	2
19	rktz35	2	5	2
20	rktz35	4	0	2
21	rktz35	7	1	2
22	rktz35	5	1	2
23	rktz35	6	2	2
24	rktz35	8	4	2
25	rvtc54	2	1	2
26	rvtc54	4	2	2
27	rvtc54	7	2	2
28	rvtc54	5	3	2
29	rvtc54	6	2	2
30	rvtc54	8	1	2
31	nnrj43	2	1	2
32	nnrj43	4	1	2
33	nnrj43	7	1	2
34	nnrj43	5	0	2
35	nnrj43	6	0	2
36	nnrj43	8	0	2
\.


--
-- Name: election_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('election_votes_id_seq', 36, true);


--
-- Data for Name: elections; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY elections (id, title, status) FROM stdin;
2	JCR Meeting 13th March 2016	2
\.


--
-- Name: elections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('elections_id_seq', 3, true);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY events (id, name, slug, "timestamp", description, image) FROM stdin;
3	End of Epiphany Term	end-of-epiphany-term	2016-03-18 23:59:00		\N
5	Fashion Show	fashion-show	2016-04-28 19:00:00	<p>The Fashion Show will be held at Dunelm House, in the Fonteyn Ballroom.</p>\r\n	\N
1	Phoenix Ball	phoenix-ball	2016-06-08 15:08:00	<p>This is a test event!</p>\r\n	\N
2	Grey Day	grey-day	2016-06-04 17:06:00	<p>Grey Day falls on the first Saturday after exams every year, and is a celebration of all of the best things about Grey. Whether you&#39;re sunning yourself on the lawn with a pint, dancing to the amazing live bands or enjoying the bouncy castle with your friends, it&#39;s a chilled day to celebrate a long year&#39;s hard work.</p>\r\n	\N
4	Start of Easter Term	start-of-easter-term	2016-04-23 22:00:00		\N
\.


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('events_id_seq', 5, true);


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY feedback (id, author, title, message, parentid, exec, "timestamp", anonymous) FROM stdin;
8	hsdz38	test	\N	\N	f	2016-03-06 16:33:01.431498	f
9	hsdz38	Website Feedback	I like this but I don't like this!	\N	f	2016-03-09 14:55:50.267503	f
10	hsdz38	reply	I'm glad you like that! What exactly don't you like?	9	t	2016-03-09 15:02:55.190804	f
11	hsdz38	reply	Well this this this and this.	9	f	2016-03-09 15:04:47.917226	\N
12	hsdz38	reply	Multi.\r\n\r\nLine.	9	f	2016-03-09 15:05:03.307752	\N
13	hsdz38	reply	I\r\n\r\ncan't\r\n\r\ndo\r\n\r\nmultiple\r\n\r\nlines!	9	f	2016-03-09 15:06:02.230845	\N
\.


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('feedback_id_seq', 13, true);


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY positions (id, title, description, level, slug) FROM stdin;
29	Welfare Officer	Hey, I'm Ellie a third year studying anthropology from Kent, and I am so exited to be part of your welfare team this year. I am looking forward to being a part of freshers' week and helping to arrange some super fun campaign weeks for everyone. In my spare time, when I am not in the welfare room,  I enjoy playing hockey for college and you can often find me working at the toastie bar, having boogie on a dance floor  and generally having a mooch around college with friends	2	welfare-officer-1
32	Welfare Officer	Hey Grey! My name is Julia, I'm a third year from Canada studying Environmental Geoscience, and so excited to be a part of the welfare team this year. I love being outdoors and travelling, and spend my summers leading canoe trips through some of Canada's beautiful lakes. I can't wait to be involved in such an important part of college life, and can always find time to chat if you're ever looking for someone to talk to. Looking forward to meeting all of Grey's newest members in Fresher's week!	2	welfare-officer
33	Welfare Officer	Hey I'm Kathryn, a second year Mathematician from Kent. When I'm not attempting to solve maths equations you can usually find me out for a run around Durham, playing Ultimate Frisbee or just relaxing with some yoga. Whatever I'm up to I'm always happy to have an excuse to put on the kettle for a cup of tea and a chat and I'll do my best to help. I also love to bake and if you're lucky you may even get to experience some of my quality baking (that is if I manage to stick to the recipe for once!). So don't feel shy about saying hello, I am really looking forward to being a part of the new welfare team and it would be lovely to get to know as many new members of Grey College as possible!	2	welfare-officer
1	Website Editor	In charge of websites	5	website-editor
7	FACSO		4	facso
31	Welfare Officer	Hi, I’m Jack – I’m a second year politics student and I’m very excited to be new member of the Welfare team. In politics I’m particularly interested in the environment and international security. Outside of my degree, I’m a keen rower, surfer and, even on the odd occasion, a runner at Grey. I also enjoy drumming, and I am always in interested in hearing new music, so always feel free to make suggestions! I’m really looking forward to fresher’s week and meeting all the new members of Grey.	2	welfare-officer
8	Vice-President	\N	4	vice-president
9	Chair	\N	4	chair
10	Secretary	\N	4	secretary
11	Bar Manager	\N	4	bar-manager
12	Events Manager	\N	4	events-manager
13	Services Manager	\N	4	services-manager
16	Representatives Officer	\N	4	representatives-officer
17	Sports & Societies Officer	\N	4	sports-societies-officer
18	Senior Students' Union Representative	\N	4	senior-students-union-representative
19	Publicity Officer	\N	4	publicity-officer
20	MCR President	\N	4	mcr-president
21	Assistant Treasurer	\N	3	assistant-treasurer
22	Arts Chair	\N	3	arts-chair
23	Charities Officer	\N	3	charities-officer
24	Environment and Ethics Officer	\N	3	environment-and-ethics-officer
25	Careers Officer	\N	3	careers-officer
26	Phoenix Ball Chair	\N	3	phoenix-ball-chair
27	Senior Freshers' Representative	\N	4	senior-freshers-representative
34	Welfare Officer	Hi! I'm Fran and I'm a fourth year Modern Languages student studying French and Spanish. I have spent the last few months on my year abroad living in a small rural Spanish town called Cabra which rather aptly means "Goat" but I'm looking forward to coming back to Grey for my final year in September and really getting involved with welfare and trying out some new societies. Next year I'll be living in college which is pretty handy so don't hesitate to come for a chat - however big or small	2	welfare-officer
35	Teikyo Rep	\N	1	teikyo-rep
6	President	The President is a sabbatical officer, employed by the college to oversee the JCR and ensure it runs properly.\r\n\r\nTheir main role is to act as a representative of the JCR to other bodies, such as the SCR, College and the wider University as well as external bodies should the need arise. To this end they sit on a number of University Committees as well as Grey College Council. They are also Ex-Offico members of all the committees in the College and the JCR and sit on them when required.\r\n\r\nA few more particular duties include performing the First Year Room Ballot with the Assistant Senior Tutor, organising college parenting, organising Burst the Bubble Trips and the prestigious President's Guest Night, a large dinner-dance during Epiphany Term.\r\n\r\nFor more information, see The Grey JCR Constitution, Pt 2, s3.1	4	president
3	LGBT Rep	\N	1	lgbt-rep
14	Male Welfare Officer	Hi, I’m Ed and I’m a 4th year studying Politics from Cambridge. I’m your new Male Welfare Officer and am really looking forward to it all, be it campaign weeks or Freshers week. I live in college and am always up for a chat, so if you want a word about literally anything, 100% feel free to give me a shout! Things about me - I have been known to do sport, but rarely. Big on watching sport though. I also have one thumb that is shorter than the other.	4	male-welfare-officer
15	Female Welfare Officer	Hey I’m Malin, I am a third year studying Psychology from Norway, and lucky enough to be the new Female Welfare Officer. I love traveling and exploring new places, as well as meeting people from different cultures along the way. Though I am always keen to try a variety of different sports (and some attempts have been more successful than others!), I love being a part of the Grey Basketball team. So when I am not on the court, or in lectures, I am always free for a chat over a coffee. I’m really excited for Freshers’ week, and I can’t wait to meet all of the new members of Grey College!	4	female-welfare-officer
\.


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('positions_id_seq', 35, true);


--
-- Data for Name: userpositions; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY userpositions (id, username, "position") FROM stdin;
1	hsdz38	1
5	mzqb55	3
7	nnrj43	6
8	dqvn53	7
14	rwqm43	8
15	jlgc75	14
16	msnz42	15
17	flwl25	29
18	gcxd83	31
19	vcgh16	32
20	vbnl43	33
21	sgxm11	34
\.


--
-- Name: userpositions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: grey
--

SELECT pg_catalog.setval('userpositions_id_seq', 21, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: grey
--

COPY users (username, email, name) FROM stdin;
dqvn53	bethany.allen@durham.ac.uk	Bethany Allen
jbcw54	i.e.mackenzie@durham.ac.uk	Isla Mackenzie
jlgc75	edward.noble@durham.ac.uk	Edward Noble
gcxd83	jack.hodges@durham.ac.uk	Jack Hodges
flwl25	elena.sagrott@durham.ac.uk	Elena Sagrott
vbnl43	k.e.stockton@durham.ac.uk	Kathryn Stockton
vcgh16	julia.windeler@durham.ac.uk	Julia Windeler
sgxm11	f.i.cornwall@durham.ac.uk	Francesca Cornwall
hsdz38	b.c.willis@durham.ac.uk	Ben Willis
nnrj43	c.j.c.caton@durham.ac.uk	Courtney Caton
rwqm43	shaun.stillwell@durham.ac.uk	Shaun Stillwell
mzqb55	lucie.daniel-watanabe@durham.ac.uk	Lucie Daniel-watanabe
msnz42	malin.aluwini-fiska@durham.ac.uk	Malin Fiska
rktz35	robert.williamson2@durham.ac.uk	Robert Williamson
rvtc54	matthew.jacobs@durham.ac.uk	Matthew Jacobs
\.


--
-- Name: blog_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY blog
    ADD CONSTRAINT blog_pkey PRIMARY KEY (id);


--
-- Name: election_nominations_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY election_nominations
    ADD CONSTRAINT election_nominations_pkey PRIMARY KEY (id);


--
-- Name: election_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY election_positions
    ADD CONSTRAINT election_positions_pkey PRIMARY KEY (id);


--
-- Name: election_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY election_votes
    ADD CONSTRAINT election_votes_pkey PRIMARY KEY (id);


--
-- Name: elections_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY elections
    ADD CONSTRAINT elections_pkey PRIMARY KEY (id);


--
-- Name: events_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: positions_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: userpositions_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY userpositions
    ADD CONSTRAINT userpositions_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: grey; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: blog_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY blog
    ADD CONSTRAINT blog_author_fkey FOREIGN KEY (author) REFERENCES users(username);


--
-- Name: blog_positionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY blog
    ADD CONSTRAINT blog_positionid_fkey FOREIGN KEY (positionid) REFERENCES positions(id);


--
-- Name: election_nominations_electionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_nominations
    ADD CONSTRAINT election_nominations_electionid_fkey FOREIGN KEY (electionid) REFERENCES elections(id) ON DELETE CASCADE;


--
-- Name: election_nominations_positionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_nominations
    ADD CONSTRAINT election_nominations_positionid_fkey FOREIGN KEY (positionid) REFERENCES election_positions(id) ON DELETE CASCADE;


--
-- Name: election_positions_electionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_positions
    ADD CONSTRAINT election_positions_electionid_fkey FOREIGN KEY (electionid) REFERENCES elections(id) ON DELETE CASCADE;


--
-- Name: election_votes_electionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_votes
    ADD CONSTRAINT election_votes_electionid_fkey FOREIGN KEY (electionid) REFERENCES elections(id);


--
-- Name: election_votes_nominationid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_votes
    ADD CONSTRAINT election_votes_nominationid_fkey FOREIGN KEY (nominationid) REFERENCES election_nominations(id);


--
-- Name: election_votes_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY election_votes
    ADD CONSTRAINT election_votes_username_fkey FOREIGN KEY (username) REFERENCES users(username);


--
-- Name: feedback_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY feedback
    ADD CONSTRAINT feedback_author_fkey FOREIGN KEY (author) REFERENCES users(username);


--
-- Name: feedback_parentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY feedback
    ADD CONSTRAINT feedback_parentid_fkey FOREIGN KEY (parentid) REFERENCES feedback(id);


--
-- Name: userpositions_position_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY userpositions
    ADD CONSTRAINT userpositions_position_fkey FOREIGN KEY ("position") REFERENCES positions(id);


--
-- Name: userpositions_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: grey
--

ALTER TABLE ONLY userpositions
    ADD CONSTRAINT userpositions_username_fkey FOREIGN KEY (username) REFERENCES users(username);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--


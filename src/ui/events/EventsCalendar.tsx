import * as React from "react";

import { Button, Header, Icon, Label, Segment, Table } from "semantic-ui-react";
import greyAPI from "../greyAPI";

interface Event {
    id: number;
    name: string;
    slug: string;
    description?: string;
    time: string;
    image?: string;
}

interface EventsCalendarProps {
    initialYear: number;
    initialMonth: number;
    onMonthChange?: (month: number, year: number) => void;
}

interface EventsCalendarState {
    year: number;
    month: number;
    events: Event[];
}

export class EventsCalendar extends React.Component<EventsCalendarProps, EventsCalendarState> {

    // tslint:disable-next-line:max-line-length
    private months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    constructor(props) {
        super(props);
        this.state = {
            year: props.initialYear,
            month: props.initialMonth,
            events: [],
        };
    }

    public componentDidMount() {
        this.getEvents();
    }

    public render() {
        const weeks = [0, 1, 2, 3, 4, 5].map((week) => {
            return (
                <Table.Row key={week}>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                        const date = this.getDateForCell(week, day);
                        return this.getCellContents(date);
                    })}
                </Table.Row>
            );
        });

        return (
            <Segment>
                <Header as="h2">{this.months[this.state.month - 1] + " " + this.state.year}</Header>
                <Table unstackable compact="very" fixed celled columns={7}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Monday</Table.HeaderCell>
                            <Table.HeaderCell>Tuesday</Table.HeaderCell>
                            <Table.HeaderCell>Wednesday</Table.HeaderCell>
                            <Table.HeaderCell>Thursday</Table.HeaderCell>
                            <Table.HeaderCell>Friday</Table.HeaderCell>
                            <Table.HeaderCell>Saturday</Table.HeaderCell>
                            <Table.HeaderCell>Sunday</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {weeks}
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan={7}>
                                <Button size="small" compact floated="left" onClick={this.prevMonth.bind(this)}>
                                    <Icon name="arrow left"/>
                                    {(this.state.month !== 1)
                                        ? this.months[this.state.month - 2] + " " + this.state.year
                                        : this.months[11] + " " + (this.state.year - 1)
                                    }
                                </Button>
                                <Button size="small" compact floated="right" onClick={this.nextMonth.bind(this)}>
                                    {(this.state.month !== 12)
                                        ? this.months[this.state.month] + " " + this.state.year
                                        : this.months[0] + " " + (this.state.year + 1)
                                    }
                                    <Icon name="arrow right"/>
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }

    private nextMonth() {
        if (this.state.month === 12) {
            this.updateMonth(1, this.state.year + 1);
        } else {
            this.updateMonth(this.state.month + 1, this.state.year);
        }
    }

    private prevMonth() {
        if (this.state.month === 1) {
            this.updateMonth(12, this.state.year - 1);
        } else {
            this.updateMonth(this.state.month - 1, this.state.year);
        }
    }

    private updateMonth(month: number, year: number) {
        this.setState({month, year}, () => {
            this.getEvents();
            if (this.props.onMonthChange) {
                this.props.onMonthChange(month, year);
            }
        });
    }

    private getCellContents(cellDate: Date): JSX.Element {
        if (cellDate.getMonth() + 1 !== this.state.month) {
            return (
                <Table.Cell key={cellDate.toDateString()}>
                    <div className="cell">
                        <Header.Subheader className="ui grey">
                            {cellDate.getDate()}
                        </Header.Subheader>
                    </div>
                </Table.Cell>
            );
        } else {
            return (
                <Table.Cell key={cellDate.toDateString()}>
                    <div className="cell">
                        <Header.Subheader className="ui">
                            {cellDate.getDate()}
                        </Header.Subheader>
                        {this.getEventsForDate(cellDate).map((event) => {
                            const eventTime = new Date(event.time);
                            return (
                                <Link to={
                                    "/events/" + eventTime.getFullYear() +
                                    "/" + (eventTime.getMonth() + 1) +
                                    "/" + eventTime.getDate() +
                                    "/" + event.slug
                                }>
                                    <Label size="small">{event.name}</Label>
                                </Link>
                            );
                        })}
                    </div>
                </Table.Cell>
            );
        }
    }

    private getEvents() {
        greyAPI.get<Event[]>(
            "/events/?year=" + this.state.year + "&month=" + this.state.month,
        ).then((res) => {
            this.setState({events: res.data});
        });
    }

    private getDateForCell(week: number, day: number): Date {
        const monthStartDay = ((new Date(this.state.year, this.state.month - 1)).getDay() + 6 ) % 7;
        const dayOfMonth = (week * 7) + day - monthStartDay;
        return new Date(this.state.year, this.state.month - 1, dayOfMonth + 1);
    }

    private getEventsForDate(date: Date): Event[] {
        return this.state.events.filter((event) => (new Date(event.time).getDate() === date.getDate()));
    }
}
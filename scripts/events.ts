import config from "../config";
import {
    disable_loading_indicator,
} from "./util/common";
// @ts-ignore - the analyzer does not know how to deal with `bundle-text` imports
import access_failure_msg from 'bundle-text:../components/events/access_failure.pug';
const {events_api_url, events_api_key, events_id, events_base_url} = config;

/**
 * See https://developers.google.com/calendar/api/v3/reference/events/list
 */
interface EventListRequestOptions {
    maxResults: number
    timeMax: string //(yyyy-mm-dd)T(hh:mm:ss)Z Without the braces
    timeMin: string //(yyyy-mm-dd)T(hh:mm:ss)Z Without the braces
    orderBy: string // Either "startTime" or "updated"
}

interface Event {
    id: string
    status: string
    created: Date
    updated: Date
    summary: string
    start: EventDate
    end: EventDate
}

interface EventDate {
    dateTime: string
    date: string
    timeZone: string
}

interface EventDates {
    start: Date
    end: Date
    created: Date
    updated: Date
}

function get_dates_from_event(event: Event): EventDates {
    let start: Date;
    let end: Date;
    if (event.start.dateTime === undefined) {
        start = new Date(new Date(event.start.date).toLocaleDateString("en", {timeZone: "America/New_York"}));
    } else {
        start = new Date(event.start.dateTime);
    }

    if (event.end.dateTime === undefined) {
        end = new Date(new Date(event.end.date).toLocaleDateString("en", {timeZone: "America/New_York"}));
    } else {
        end = new Date(event.end.dateTime);
    }
    return {start, end, created: event.created, updated: event.updated}
}

class FaEvents extends HTMLElement {
    constructor() {
        super();
        let minTime = new Date();
        minTime.setMonth(minTime.getMonth() - 4)
        this.innerHTML = "";
        this.load({
            maxResults: 0, 
            orderBy: "starttime",
            timeMax: "",
            timeMin: minTime.toISOString()
        })
    }

    load(options: EventListRequestOptions) {
        let url = `${events_api_url}${events_id}/events?key=${events_api_key}&singleEvents=true`
        if (options.maxResults !== 0) 
            url += `&maxResults=${options.maxResults}`;
        if (options.timeMax !== "")
            url += `&timeMax=${options.timeMax}`;
        if (options.timeMin !== "")
            url += `&timeMin=${options.timeMin}`;
        if (options.orderBy !== "")
            url += `&orderBy=${options.orderBy}`;
        fetch(url)
            .then(res => {
                if (res.status === 200)
                    res.json().then(res => this.display(res));
                else
                    this.access_failure();
            }).catch(_ => {
                this.access_failure();
            })
    }

    display(res) {
        let events: Event[] = res.items.reverse();
        let current_date = new Date();
        disable_loading_indicator();

        let upcoming = document.createElement("div");
        upcoming.className = "border-outer";

        let past = document.createElement("div");
        past.className = "border-outer";
        
        for (let i = 0; i < events.length; i++) {
            let event_dates = get_dates_from_event(events[i]);
            let element = document.createElement("p");
            element.className = "border-inner";
            let time_string = event_dates.start.toLocaleTimeString([],{
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'});
            element.innerText = `${time_string} - ${events[i].summary}`;
            if (event_dates.start > current_date)
                upcoming.appendChild(element);
            else 
                past.appendChild(element);
        }
        let header = document.createElement("h2");
        header.innerText = "Upcoming";
        this.appendChild(header);
        this.appendChild(upcoming);
        header = document.createElement("h2");
        header.innerText = "Past";
        this.appendChild(header);
        this.appendChild(past);
        let link = document.createElement("a");
        link.href = `${events_base_url}${events_id}`;
        link.innerText = "Add to calendar"
        this.appendChild(link);
    }

    access_failure() {
        this.classList.add('flex-center', 'center');
        this.innerHTML = access_failure_msg;
    }



}

export const init = () => {
    customElements.define("fa-events", FaEvents);
};

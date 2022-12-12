import config from "../config";
import {
    disable_loading_indicator,
} from "./util/common";
// @ts-ignore - the analyzer does not know how to deal with `bundle-text` imports
import access_failure_msg from 'bundle-text:../components/events/access_failure.pug';
const {events_api_url, events_api_key, events_id, events_base_url} = config;

/**
 *  An interface for the result of an event list api call.  
 *  Some irrelevant parameters have been ignored.  
 *  See https://developers.google.com/calendar/api/v3/reference/events/list for more information
 */

interface EventListRequest {
    king: string
    etag: string
    summary: string
    timeZone: string
    accesRole: string
    items: Event[]
    updated: Date
    nextPageToken: string
    nextSyncToken: string
}

/**
 *  An interface for the optional parameters for an event list api call.  
 *  Some irrelevant parameters have been ignored.  
 *  See https://developers.google.com/calendar/api/v3/reference/events/list for more information
 */
interface EventListRequestOptions {
    key: string
    singleEvents: boolean,
    iCalUID?: string
    maxAttendees?: number
    maxResults?: number
    orderBy?: string // Either "startTime" or "updated"
    pageToken?: string
    q?: string
    syncToken?: string
    timeMax?: string //(yyyy-mm-dd)T(hh:mm:ss)Z Without the braces
    timeMin?: string //(yyyy-mm-dd)T(hh:mm:ss)Z Without the braces
    timeZone?: string
    updatedMin?: string //(yyyy-mm-dd)T(hh:mm:ss)Z Without the braces
}

/**
 *  An interface for a single event in the result of an event list api call.  
 *  See https://developers.google.com/calendar/api/v3/reference/events/list for more information
 */
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
        start.setDate(start.getDate() + 1)
    } else {
        start = new Date(event.start.dateTime);
    }

    if (event.end.dateTime === undefined) {
        end = new Date(new Date(event.end.date).toLocaleDateString("en", {timeZone: "America/New_York"}));
        end.setDate(end.getDate() + 1)
    } else {
        end = new Date(event.end.dateTime);
    }
    return {start, end, created: event.created, updated: event.updated}
}


/**
 * Custom HTML element class for element `<fa-events>`.  
 * Represents a set of upcoming and past events
 */
class FaEvents extends HTMLElement {
    constructor() {
        super();
        let minTime = new Date();
        minTime.setMonth(minTime.getMonth() - 4)
        this.innerHTML = "";
        this.load({
            key: events_api_key,
            singleEvents: true,
            orderBy: "starttime",
            timeMin: minTime.toISOString()
        })
    }

    load(options: EventListRequestOptions) {
        let url = `${events_api_url}${events_id}/events`
        
        let params = Object.keys(options).map(key => {
            if (options[key] !== undefined) 
                return key + '=' + options[key]
        }).join('&')

        url += `?${params}`
        
        fetch(url)
            .then(res => {
                if (res.status === 200)
                    res.json().then(res => this.render_events(res));
                else
                    this.access_failure();
            }).catch(_ => {
                this.access_failure();
            })
    }

    render_events(eventList: EventListRequest) {
        let events = eventList.items.reverse();
        let current_date = new Date();
        disable_loading_indicator();


        let upcoming = document.createElement("div");
        upcoming.className = "border-outer";

        let ongoing = document.createElement("div");
        ongoing.className = "border-outer";

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
            if (event_dates.start < current_date && event_dates.end > current_date)
                ongoing.appendChild(element);
            else if (event_dates.start > current_date)
                upcoming.appendChild(element);
            else
                past.appendChild(element);
        }
        if (ongoing.children.length > 0) {
            let header = document.createElement("h2");
            header.innerText = "Ongoing";
            this.appendChild(header);
            this.appendChild(ongoing);
        }
        if (upcoming.children.length > 0){
            let header = document.createElement("h2");
            header.innerText = "Upcoming";
            this.appendChild(header);
            this.appendChild(upcoming);
        }
        if (past.children.length > 0){
            let header = document.createElement("h2");
            header.innerText = "Past";
            this.appendChild(header);
            this.appendChild(past);
        }

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

/**
 * Initializes the necessary elements for handling and rendering events.
 */
export const init = () => {
    customElements.define("fa-events", FaEvents);
};

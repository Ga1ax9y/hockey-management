import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getSchedule } from '../../services/api';
import './Schedule.css';

const Schedule = ({ teamId }) => {

    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            const response = await getSchedule(teamId, {
                startDate: info.startStr,
                endDate: info.endStr
            });

            const formattedEvents = response.data.data.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.endDate || event.end,
                extendedProps: {
                    type: event.type,
                    location: event.extendedProps.location,
                    ...event.details
                }
            }));
            successCallback(formattedEvents);
        } catch (error) {
            console.error("Error loading schedule:", error);
            failureCallback(error);
        }
    };

    const renderEventContent = (eventInfo) => {
        const type = eventInfo.event.extendedProps.type;
        const title = eventInfo.event.title;
        const time = eventInfo.timeText;

        return (
            <div className={`calendar-event-wrapper ${type?.toLowerCase()}`}>
                <span className="event-icon">
                    {type === 'MATCH' ? '🏒' : '🏋️'}
                </span>
                <div className="event-info">
                    {time && <span className="event-time">{time}</span>}
                    <span className="event-title">{title}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="schedule-container">
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                locale="ru"
                firstDay={1}
                events={fetchEvents}
                eventContent={renderEventContent}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                }}
                height="auto"
            />
        </div>
    );
};

export default Schedule;

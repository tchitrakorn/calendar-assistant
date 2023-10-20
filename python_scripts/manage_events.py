import datetime
from typing import Any, List, Optional, Union

import pytz
from geopy.geocoders import Nominatim
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from timezonefinder import TimezoneFinder

from python_scripts.timezone_utils import convertTime, currentTime, userTimeZone, calendarTimeZone

CLIENT_CITY = "Los Angeles" #using a placeholder city for now
with open('credentials.json', 'r') as token_file:
      creds = Credentials.from_authorized_user_file('credentials.json')
  
try:
    service = build('calendar', 'v3', credentials=creds)
except HttpError as error:
    print("An error occurred: ", error)

# Reference: https://developers.google.com/calendar/api/guides/create-events
def createEvent(summary: Optional[str] = None, \
                description: Optional[str] = None, \
                location: Optional[str] = None, \
                start_datetime: Optional[Union[str, datetime.datetime]] = None, \
                end_datetime: Optional[Union[str, datetime.datetime]] = None, \
                attendees: Optional[List[str]] = None) -> str:
        """
        Create an event on a user's calendar.
        Args:
            summary (Optional[str]): The title / summary for the event
            description (Optional[str]): The description for the event
            location (Optional[str]): The location for the event
            start_datetime Optional[Union[str, datetime.datetime]]: The start datetime for the event
            end_datetime Optional[Union[str, datetime.datetime]]: The end datetime for the event
            attendees Optional[List[str]]: A list of email address to invite to the event
        """
        localTimeZone = userTimeZone(CLIENT_CITY)
        local_tz = pytz.timezone(localTimeZone)

        attendees_list = []
        for attendee in attendees:
            attendees_list.append({"email": attendee})

        start_time = local_tz.localize(
            datetime.datetime.strptime(start_datetime, "%Y-%m-%dT%H:%M:%S")
        )

        end_time = local_tz.localize(
            datetime.datetime.strptime(end_datetime, "%Y-%m-%dT%H:%M:%S")
        )

        calendar_tz = calendarTimeZone(service)

        event = {
            "summary": summary,
            "location": location,
            "description": description,
            "start": {
                "dateTime": convertTime(str(start_time), calendar_tz),
                "timeZone": calendar_tz
            },
            "end": {
                "dateTime": convertTime(str(end_time), calendar_tz),
                "timeZone": calendar_tz
            },
            "attendees": attendees_list,
        }
        event = service.events().insert(calendarId="primary", body=event).execute()
        return "Your calendar event has been created successfully!"
      
      
createEvent(summary="Test Event")
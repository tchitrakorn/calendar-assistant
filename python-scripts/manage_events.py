import datetime
from typing import Any, List, Optional, Union

import pytz
from geopy.geocoders import Nominatim
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from timezonefinder import TimezoneFinder


CLIENT_CITY = "Los Angeles" #using a dummy city for now
with open('credentials.json', 'r') as token_file:
      creds = Credentials.from_authorized_user_file('credentials.json')
  
try:
    service = build('calendar', 'v3', credentials=creds)
except HttpError as error:
    print("An error occurred: ", error)
    
  
def userTimeZone(city_name:str):
  """Get the time zone based on a user's city"""
  geolocator = Nominatim(user_agent="timezone_app")
  # Use geopy to get the coordinates (latitude and longitude) of the city
  location = geolocator.geocode(city_name)

  output = None
  if location:
      latitude = location.latitude
      longitude = location.longitude
      tz_finder = TimezoneFinder()

      # Get the time zone of the specified coordinates
      timezone_str = tz_finder.timezone_at(lat=latitude, lng=longitude)
      if timezone_str:
          print(f"Time zone of {city_name}: {timezone_str}")
          output = timezone_str
      else:
          print("Time zone not found for the provided coordinates.")
  else:
      print(f"Coordinates not found for {city_name}.")
  return output

def currentTime(timeZone:str):
  """Get the current time based on a provided time zone"""
  desired_timezone = pytz.timezone('Asia/Shanghai')
  current_time = datetime.datetime.now(desired_timezone)
  current_time_str = current_time.isoformat()
  print(current_time_str)
  return current_time_str

def convertTime(original_datetime_str, \
                target_timezone_str):
  """
  Convert a datetime string in one timezone to another timezone
  Args: Original datetime string is in ISO 8601 format, e.g., '2023-10-20T07:00:00-05:00'
  """
  original_datetime = datetime.datetime.fromisoformat(original_datetime_str)
  target_timezone = pytz.timezone(target_timezone_str)
  target_datetime = original_datetime.astimezone(target_timezone)
  # Format the target datetime as a string in ISO 8601 format
  target_datetime_str = target_datetime.isoformat()
  return target_datetime_str

def calendarTimeZone():
  # Get the user's primary calendar
  calendar_list_entry = service.calendarList().get(calendarId='primary').execute()
  # Retrieve the time zone of the user's primary calendar
  time_zone = calendar_list_entry.get('timeZone')
  return time_zone


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

        calendar_tz = calendarTimeZone()

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
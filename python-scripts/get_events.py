import datetime
import os

import pytz
from geopy.geocoders import Nominatim
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.client import OAuth2WebServerFlow
from timezonefinder import TimezoneFinder


with open('./python-scripts/credentials.json', 'r') as token_file:
      creds = Credentials.from_authorized_user_file('./python-scripts/credentials.json')
  
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

def upcomingEvents(service, CLIENT_CITY)-> str:
  """Print the start and name of upcoming events (up to 10) on the user's calendar"""

  # now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
  localTimeZone = userTimeZone(CLIENT_CITY)
  now = currentTime(localTimeZone)
  output = 'Getting the upcoming 10 events\n'
  events_result = service.events().list(calendarId='primary', timeMin=now,
                                              maxResults=10, singleEvents=True,
                                              orderBy='startTime').execute()
  events = events_result.get('items', [])
  if not events:
    return output + 'No upcoming events found.'

  # Prints the start and name of the next 10 events
  for event in events:
    start = event['start'].get('dateTime', event['start'].get('date'))
    output += str(event['summary']) + "\n" + f"   - Calendar Time Zone: {str(event['start']['timeZone'])}" + " " + str(start) + "\n" \
            + f"   - Local Time Zone: {str(localTimeZone)}" + " " + str(convertTime(start, localTimeZone)) + "\n"
  return output


# upcomingEvents(service, "Guangzhou")
events = upcomingEvents(service, "Guangzhou") 
print(events) 
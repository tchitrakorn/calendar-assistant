import datetime
import os

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.client import OAuth2WebServerFlow

from python_scripts.timezone_utils import convertTime, currentTime, userTimeZone, calendarTimeZone


with open('./python_scripts/credentials.json', 'r') as token_file:
      creds = Credentials.from_authorized_user_file('./python_scripts/credentials.json')
  
try:
    service = build('calendar', 'v3', credentials=creds)
except HttpError as error:
    print("An error occurred: ", error)

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
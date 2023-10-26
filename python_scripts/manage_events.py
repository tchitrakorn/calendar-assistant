# Import required packages
from typing import List, Optional, Union
from llama_index.tools import FunctionTool
from llama_index.llms import OpenAI
from llama_index.agent import ReActAgent

from googleapiclient.discovery import build
import datetime, textwrap, sys

from google.oauth2.credentials import Credentials
from googleapiclient.errors import HttpError

import pytz

from timezone_utils import convertTime, userTimeZone, calendarTimeZone

client_id = sys.argv[1]
client_secret = sys.argv[2]
access_token = sys.argv[3]
refresh_token = sys.argv[4]
openai_key = sys.argv[5]
city = sys.argv[6]
prompt = sys.argv[7]

credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="http://localhost:8080/oauth2callback", 
            client_id=client_id,
            client_secret=client_secret,
        )

try:
    service = build('calendar', "v3", credentials=credentials)
    # print("Successfully connected to Google Calendar API")
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
    localTimeZone = userTimeZone(city)
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

# Initialize agent with tools available to use and a specific LLM
createEvent_tool = FunctionTool.from_defaults(fn=createEvent)

system_prompt = "When reporting event times, use the local time zone corresponding to the user's city."
llm = OpenAI(model = "gpt-3.5-turbo", temperature = 0.2, \
             api_key = openai_key, system_prompt = system_prompt)
agent = ReActAgent.from_tools([createEvent_tool], llm=llm, verbose=False)

def wrap_text(string, width=60):
  wrapped_text = textwrap.wrap(string, width=width)
  formatted_text = '\n'.join(wrapped_text)
  return formatted_text


ans = agent.chat(prompt)
print(wrap_text(ans.response))
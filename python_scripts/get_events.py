from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import sys
import textwrap

from timezone_utils import convertTime, currentTime, userTimeZone

from llama_index.tools import FunctionTool
from llama_index.llms import OpenAI
from llama_index.agent import ReActAgent, OpenAIAgent

client_id = sys.argv[1]
client_secret = sys.argv[2]
access_token = sys.argv[3]
refresh_token = sys.argv[4]
openai_key = sys.argv[5]
prompt = sys.argv[6]

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

def upcomingEvents()-> str:
    """Print the start and name of upcoming events (up to 10) on the user's calendar"""

    # now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    localTimeZone = userTimeZone("New York")
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

# Initialize agent with tools available to use and a specific LLM
upcomingEvents_tool = FunctionTool.from_defaults(fn=upcomingEvents)
# createEvent_tool = FunctionTool.from_defaults(fn=createEvent)

system_prompt = "When reporting event times, use the local time zone corresponding to the user's city."
llm = OpenAI(model = "gpt-3.5-turbo", temperature = 0.2, \
             api_key = openai_key, system_prompt = system_prompt)

agent = ReActAgent.from_tools([upcomingEvents_tool], llm=llm, verbose=False)


def wrap_text(string, width=60):
  wrapped_text = textwrap.wrap(string, width=width)
  formatted_text = '\n'.join(wrapped_text)
  return formatted_text

ans = agent.chat(prompt)
print(wrap_text(ans.response))
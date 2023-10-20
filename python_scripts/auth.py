import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from oauth2client.client import OAuth2WebServerFlow

def authorize():
    # User's Google Cloud Project Client ID & Client Secret/Key, and OpenAI API Key
    CLIENT_ID = os.environ.get("CLIENT_ID")
    CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
    # not used currently
    # OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

    # CLIENT_CITY = "Guangzhou"

    # Define Oath scopes
    # SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'] # read only
    SCOPES = ["https://www.googleapis.com/auth/calendar"]
    ENVIRONMENT = "Colab"

    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time / when we first receive CLIENT_ID and CLIENT_SECRET from a user.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if ENVIRONMENT == "Colab":
                # Redirect URI to open Authorization Code Window in Browser
                REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'

                # Build URL that generates Authorization Code
                flow = OAuth2WebServerFlow(CLIENT_ID, CLIENT_SECRET, SCOPES, REDIRECT_URI)
                authorize_url = flow.step1_get_authorize_url()

                # Print Authorization URL
                print("Please go to the following link in your browser and copy the authorization code:\n" \
                        + authorize_url)
                # this is currently throwing an error
                # since we can't accept input during script execution
                # in later refinement we'll solve this by moving
                # the authorization logic to separate endpoints
                auth_code = input("Enter your authorization code here:")

                # Get credentials to build GSC API service
                creds = flow.step2_exchange(auth_code)
                print("The credentials are genereted successfully")
                
                # Save the credentials for the next run
                with open('credentials.json', 'w') as token_file:
                    token_file.write(creds.to_json())

            if ENVIRONMENT == "Local":
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        # with open('token.json', 'w') as token:
        #     token.write(creds.to_json())



authorize()
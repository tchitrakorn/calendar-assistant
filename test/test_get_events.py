import unittest
from unittest.mock import patch, Mock
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import Resource
from googleapiclient.errors import HttpError

from python_scripts.get_events import upcomingEvents

class TestGetEvents(unittest.TestCase):
    @patch('python_scripts.timezone_utils.userTimeZone', return_value='Asia/Shanghai')
    @patch('python_scripts.timezone_utils.currentTime', return_value='2023-10-21T13:00:00+08:00')
    @patch('googleapiclient.discovery.build')
    def test_upcomingEvents(self, mock_build, mock_current_time, mock_user_timezone):
        # Create a mock service instance
        mock_service = mock_build.return_value

        # Mock the list() and execute() methods for the service
        mock_list = mock_service.events().list()
        mock_list.execute.return_value = self.mock_events_result

        # Call the function
        events = upcomingEvents(mock_service, "Guangzhou")

        # Assertions
        self.assertIn("Getting the upcoming 10 events", events)

    @patch('googleapiclient.discovery.build')
    def test_upcomingEvents_no_events(self, mock_build):
        # Create a mock service instance
        mock_service = mock_build.return_value

        # Mock the list() and execute() methods for the service to return an empty list
        mock_list = mock_service.events().list()
        mock_list.execute.return_value = {'items': []}

        # Call the function
        events = upcomingEvents(mock_service, "Guangzhou")

        # Assertions
        self.assertIn("Getting the upcoming 10 events", events)
        self.assertIn("No upcoming events found.", events)

    # @patch('python_scripts.timezone_utils.userTimeZone', return_value=None)
    # @patch('googleapiclient.discovery.build')
    # def test_upcomingEvents_no_timezone(self, mock_build, mock_user_timezone):
    #     # Create a mock service instance
    #     mock_service = mock_build.return_value

    #     # Call the function with a city name for which timezone is not found
    #     events = upcomingEvents(mock_service, "InvalidCity")

    #     # Assertions
    #     self.assertIn("Getting the upcoming 10 events", events)
    #     self.assertIn("Coordinates not found for InvalidCity.", events)

    @property
    def mock_events_result(self):
        # You can customize this to simulate events data for your test cases
        return {
            'items': [
                {
                    'summary': 'Event 1',
                    'start': {
                        'dateTime': '2023-10-21T00:00:00-05:00',
                        'timeZone': 'America/Chicago'
                    }
                },
                {
                    'summary': 'Event 2',
                    'start': {
                        'dateTime': '2023-10-24T11:00:00-05:00',
                        'timeZone': 'America/Chicago'
                    }
                },
            ]
        }

if __name__ == '__main__':
    unittest.main()
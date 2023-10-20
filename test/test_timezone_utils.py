import unittest
from unittest.mock import patch
from datetime import datetime
import pytz
from python_scripts import timezone_utils
from python_scripts.timezone_utils import convertTime, currentTime, userTimeZone, calendarTimeZone

class TestTimezoneUtils(unittest.TestCase):

    def test_userTimeZone_valid(self):
        # Test with a valid city
        city = "Los Angeles"
        result = userTimeZone(city)
        self.assertIsNotNone(result)
        self.assertEqual(result, "America/Los_Angeles")
        print("Test userTimeZone_valid passed")

    def test_userTimeZone_invalid_city(self):
        # Test with an invalid city
        city = "This is an invalid city"
        result = userTimeZone(city)
        self.assertIsNone(result)
        print("Test userTimeZone_invalid_city passed")

    def test_currentTime(self):
        # Define the Shanghai timezone
        timezone = pytz.timezone('Asia/Shanghai')
        # Get the current time in Shanghai
        current_time_shanghai = datetime.now(timezone)

        result_str = currentTime('Asia/Shanghai')
    
        # Parse the result string back to a datetime object
        result = datetime.fromisoformat(result_str)
        # compare up to minutes to avoid second mismatch
        self.assertEqual(current_time_shanghai.year, result.year)
        self.assertEqual(current_time_shanghai.month, result.month)
        self.assertEqual(current_time_shanghai.day, result.day)
        self.assertEqual(current_time_shanghai.hour, result.hour)
        self.assertEqual(current_time_shanghai.minute, result.minute)

        print("Test currentTime passed")

    def test_convertTime(self):
        original_time = '2023-10-20T07:00:00-05:00'
        target_timezone = 'Asia/Shanghai'
        result = convertTime(original_time, target_timezone)
        # Validate the result against a known value
        self.assertEqual(result, '2023-10-20T20:00:00+08:00')
        print("Test convertTime passed")

    @patch('python_scripts.timezone_utils.calendarTimeZone')
    def test_calendarTimeZone(self, mock_service):
        mock_service.calendarList.return_value.get.return_value.execute.return_value = {'timeZone': 'America/Los_Angeles'}
        result = calendarTimeZone(mock_service)
        self.assertEqual(result, 'America/Los_Angeles')
        print("Test calendarTimeZone passed")

if __name__ == '__main__':
    unittest.main()

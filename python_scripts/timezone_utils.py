import datetime

import pytz
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder


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

def currentTime(time_zone:str):
    """Get the current time based on a provided time zone"""
    desired_timezone = pytz.timezone(time_zone)
    current_time = datetime.datetime.now(desired_timezone)
    current_time_str = current_time.isoformat()
    # print(current_time_str)
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

def calendarTimeZone(service):
    # Get the user's primary calendar
    calendar_list_entry = service.calendarList().get(calendarId='primary').execute()
    # Retrieve the time zone of the user's primary calendar
    time_zone = calendar_list_entry.get('timeZone')
    return time_zone

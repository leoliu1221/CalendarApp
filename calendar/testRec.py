from bs4 import BeautifulSoup
import re;
import requests;
import datetime;
import icalendar;
from datetime import datetime;
import pytz
from icalendar import vCalAddress, vText
from icalendar import vDatetime
from icalendar import Calendar, Event

cal = Calendar()
cal.add('dtstart', datetime(2005,4,4,8,0,0))
cal.add('dtend', datetime(2005,4,10,8,0,0))
event = Event()
event.add('summary', 'Python meeting about calendaring')
event.add('dtstart', datetime(2005,4,4,8,0,0,tzinfo=pytz.utc))
event.add('dtend', datetime(2005,4,4,10,0,0,tzinfo=pytz.utc))
event.add('rrule',{'freq':'weekly','count':10});
event.add('description','exampledescription');
event.add('location','tech342');
cal.add_component(event)
f=open('test.ics','wb');
f.write(cal.to_ical());
f.close();
